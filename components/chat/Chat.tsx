export default function Chat() {
  return (
    <main className="flex h-screen flex-col bg-black text-white">
      {/* Header */}
      <header className="h-16 border-b border-zinc-800 px-6 flex items-center">
        <h1 className="text-2xl font-semibold">Chabot</h1>
      </header>

      {/* Messages */}
      <section className="flex-1 overflow-y-auto">
        {/* Messages will go here */}
      </section>

      {/* Input */}
      <footer className="border-t border-zinc-800 p-4">
        {/* Input will go here */}
      </footer>
    </main>
  );
}