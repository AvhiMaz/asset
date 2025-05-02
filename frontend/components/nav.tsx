import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="fixed top-10 md:top-10 lg:top-10 left-0 right-0 lg:left-50 lg:right-50 rounded-lg backdrop-blur-xs z-50 border">
      <div className="container mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link href="/" className="font-medium text-xl tracking-tighter">timeloop vault</Link>
        </div>
        <div className="flex items-center ">
          <div
            className="border-zinc-300 text-xl font-medium flex items-center tracking-tighter text-center cursor-pointer"
          >
            <WalletMultiButton style={{
              background: "transparent",
              color: "#111",
              fontSize: "20px",
              fontWeight: "500",
              padding: "0",
              textTransform: "lowercase",
            }} />
          </div>
        </div>
      </div>
    </nav>

  )
}
