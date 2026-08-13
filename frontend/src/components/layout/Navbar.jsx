import { Bell, Search, User } from "lucide-react";

function Navbar() {
  return (
    <header className="h-20 flex items-center justify-between px-8 bg-[#080B1A]/80 backdrop-blur-xl border-b border-white/10">

      {/* Search */}
      <div className="flex items-center gap-3 bg-[#1A1F35] rounded-2xl px-4 py-3 w-96 border border-white/5">

        <Search size={20} className="text-gray-400" />

        <input
          type="text"
          placeholder="Search anything..."
          className="bg-transparent outline-none text-white placeholder-gray-500 w-full"
        />

      </div>


      {/* Right Side */}
      <div className="flex items-center gap-5">

        <button className="relative p-3 rounded-xl bg-[#1A1F35] hover:bg-white/10 transition">

          <Bell size={20} />

          <span className="absolute top-2 right-2 w-2 h-2 bg-[#7C5CFC] rounded-full" />

        </button>


        <div className="flex items-center gap-3 bg-[#1A1F35] px-4 py-2 rounded-2xl">

          <div className="w-10 h-10 rounded-full bg-[#7C5CFC] flex items-center justify-center">
            <User size={20}/>
          </div>

          <div>
            <p className="text-sm font-semibold">
              Humma
            </p>

            <p className="text-xs text-gray-400">
              Premium User
            </p>
          </div>

        </div>

      </div>

    </header>
  );
}

export default Navbar;