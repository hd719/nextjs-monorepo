package whoop

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"io"
	"os"
)

// Encrypt builds an AES‑GCM cipher from your 32‑byte key, generates a random nonce, and uses it to encrypt + authenticate the plaintext. It then prepends the nonce to the ciphertext and base64‑encodes the result so it can be safely stored in a text column.
func Encrypt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", errors.New("plaintext is empty")
	}

	key, err := loadEncryptionKey()
	if err != nil {
		return "", err
	}

	// This creates an AES block cipher from the 32‑byte key.
	// Think of it as the "raw encryption engine" for AES‑256
	// AES is a block cipher, meaning it operates on 16‑byte blocks at a time.
	// The value block isn’t “data" -> it's the cipher object that knows how to encrypt/decrypt blocks using your key (16 Byte Transformer)
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	// Galios/Counter Mode (GCM) is a secure encryption mode that turns the AES block cipher into:
	// Confidentiality (data is encrypted)
	// Integrity (tampering is detected)
	// cipher.NewGCM(block) takes the AES engine (block) and returns a GCM cipher instance (16 Byte Transformer)
	// That instance provides methods like Seal and Open to encrypt/decrypt safely with a nonce
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	// A nonce is a unique random value used once per encryption
	// In GCM, the nonce is required to keep encryption secure; re‑using the same nonce with the same key breaks security.
	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	// Seal encrypts + authenticates the plaintext using the nonce.
	// It returns the ciphertext (includes GCM auth tag).
	// Example: plaintext="secret" -> ciphertext=[]byte{0x9a, 0x1b, ...}
	ciphertext := gcm.Seal(nil, nonce, []byte(plaintext), nil)

	// We store nonce + ciphertext together so we can decrypt later.
	// Example payload layout:
	// [nonce(12 bytes)] + [ciphertext+tag]
	payload := append(nonce, ciphertext...)

	// Encode the payload as base64 so it's safe to store in a text DB column.
	// Example: payload (binary bytes) -> "mV4p...=="
	return base64.StdEncoding.EncodeToString(payload), nil
}

// Decrypt reverses Encrypt: base64 decode, split nonce/ciphertext, and open with AES‑GCM.
func Decrypt(ciphertext string) (string, error) {
	if ciphertext == "" {
		return "", errors.New("ciphertext is empty")
	}

	key, err := loadEncryptionKey()
	if err != nil {
		return "", err
	}

	raw, err := base64.StdEncoding.DecodeString(ciphertext)
	if err != nil {
		return "", errors.New("ciphertext must be base64")
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonceSize := gcm.NonceSize()
	if len(raw) < nonceSize {
		return "", errors.New("ciphertext too short")
	}

	nonce := raw[:nonceSize]
	encrypted := raw[nonceSize:]

	plaintext, err := gcm.Open(nil, nonce, encrypted, nil)
	if err != nil {
		return "", err
	}

	return string(plaintext), nil
}

// loadEncryptionKey reads WHOOP_TOKEN_ENCRYPTION_KEY from env.
// The key must be base64-encoded 32 bytes (AES-256)
func loadEncryptionKey() ([]byte, error) {
	raw := os.Getenv("WHOOP_TOKEN_ENCRYPTION_KEY")
	if raw == "" {
		return nil, errors.New("WHOOP_TOKEN_ENCRYPTION_KEY is required")
	}

	// Check if the key is base64 encoded an then decodes it to raw 32 bytes needed for AES-256
	// AES (Advanced Encryption Standard that uses a 256-bit key) which is used to encrypt the token
	// Symmetric = same key encrypts and decrypts in our case we use the same key for encryption and decryption
	// 256-bit key = 32 bytes of key material.

	key, err := base64.StdEncoding.DecodeString(raw)
	if err != nil {
		return nil, errors.New("WHOOP_TOKEN_ENCRYPTION_KEY must be base64")
	}

	if len(key) != 32 {
		return nil, errors.New("WHOOP_TOKEN_ENCRYPTION_KEY must be 32 bytes (base64)")
	}

	return key, nil
}
