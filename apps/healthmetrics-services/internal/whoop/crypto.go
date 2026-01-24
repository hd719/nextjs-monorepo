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

// Encrypt secures a plaintext token using AES-256-GCM
// Output is base64(nonce || ciphertext).
func Encrypt(plaintext string) (string, error) {
	if plaintext == "" {
		return "", errors.New("plaintext is empty")
	}

	key, err := loadEncryptionKey()
	if err != nil {
		return "", err
	}

	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}

	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}

	nonce := make([]byte, gcm.NonceSize())
	if _, err := io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}

	ciphertext := gcm.Seal(nil, nonce, []byte(plaintext), nil)
	payload := append(nonce, ciphertext...)

	return base64.StdEncoding.EncodeToString(payload), nil
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
