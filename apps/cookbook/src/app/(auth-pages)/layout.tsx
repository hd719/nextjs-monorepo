export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex w-full min-w-[400px] flex-col items-start">
      {children}
    </div>
  );
}
