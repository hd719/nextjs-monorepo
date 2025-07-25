import { createClient } from "@/app/utils/supabase/server";

export default async function Page() {
  const supabase = await createClient();
  const { data: notes } = await supabase.from("notes").select();

  return <pre>{JSON.stringify(notes, null, 2)}</pre>;
}

// Alternatively, you can use a Client Component.

// 'use client'

// import { createClient } from '@/utils/supabase/client'
// import { useEffect, useState } from 'react'

// export default function Page() {
//   const [notes, setNotes] = useState<any[] | null>(null)
//   const supabase = createClient()

//   useEffect(() => {
//     const getData = async () => {
//       const { data } = await supabase.from('notes').select()
//       setNotes(data)
//     }
//     getData()
//   }, [])

//   return <pre>{JSON.stringify(notes, null, 2)}</pre>
// }
