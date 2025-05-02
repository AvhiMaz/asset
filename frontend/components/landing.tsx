"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "../components/ui/aurora-background";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { AnimatedGradientTextDemo } from "./badge";
import Navbar from "./nav";

export function Background() {
  return (
    <AuroraBackground>
      <Navbar />
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative min-h-screen w-full flex flex-col gap-4 items-center justify-center lowercase"
      >
        <AnimatedGradientTextDemo />
        <div className="text-4xl md:text-6xl mx-10 text-center lowercase tracking-tighter">
          Lock asset in time, Deliver to the future
        </div>
        <div className="font-extralight text-lg mx-10 lg:text-xl text-center tracking-tighter">
          Timeloop Vault lets you lock any digital asset on Solana and schedule its <br />delivery to a recipient at a future date.
        </div>
        <div className="flex gap-3 mt-4">
          <Link href="/create-vault">
            <Button className="lowercase cursor-pointer p-5 lg:p-6">
              Create Vault <ArrowRight className="w-[1px] h-[1px]" />
            </Button>

          </Link>
          <div className="lowercase flex items-center justify-center border-2 py-[5px] px-6 rounded-lg cursor-pointer">
            Learn More
          </div>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}

