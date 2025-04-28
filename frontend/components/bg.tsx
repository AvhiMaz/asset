"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "../components/ui/aurora-background";
import { ArrowRight, Wallet } from "lucide-react";
import { Button } from "./ui/button";
import Link from "next/link";
import { AnimatedGradientTextDemo, Badge } from "./badge";

export function Background() {
  const assets = [
    { src: "/solana.png", alt: "Solana" },
    { src: "/usdc.png", alt: "USDC" },
    { src: "/image.png", alt: "Image" },
    { src: "/text.png", alt: "Text" },
    { src: "/voice.png", alt: "Voice" },
  ];

  return (
    <AuroraBackground>
      <nav className="py-4 fixed top-0 md:top-10 lg:top-10 left-0 right-0 lg:left-50 lg:right-50 rounded-lg backdrop-blur-xs z-50 border">
        <div className="container mx-auto flex items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <Link href="/" className="font-medium text-xl tracking-tighter">timeloop vault</Link>
          </div>
          <div className="flex items-center gap-4">
            <div
              className="border-zinc-300 text-xl font-medium flex items-center tracking-tighter text-center cursor-pointer"
            >
              <Wallet className="mr-2 h-5 w-5" /> connect wallet
            </div>
          </div>
        </div>
      </nav>

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
        <AnimatedGradientTextDemo/>
        <div className="text-4xl md:text-6xl mx-10 text-center lowercase tracking-tighter">
          Lock asset in time, Deliver to the future
        </div>
        <div className="font-extralight text-md mx-10 lg:text-xl text-center tracking-tighter">
          Timeloop Vault lets you lock any digital asset on Solana and schedule its delivery to a recipient at a future date.
        </div>
        <div className="font-extralight text-md mx-10 lg:text-xl text-center tracking-tighter">
          lock a variety of assets, including:
        </div>

      <div className="flex flex-wrap justify-center gap-3 lg:gap-4 mt-2">
        {assets.map((asset, index) => (
        <img
        key={index}
        src={asset.src}
        alt={asset.alt}
        className="w-12 lg:w-14 lg:h-14 object-contain grayscale transition-all duration-300 ease-in-out hover:grayscale-0" 
      />
      ))}

      </div>
        <div className="flex gap-3 mt-6">
          <Button className="lowercase cursor-pointer p-5 lg:p-6">
            Create Vault <ArrowRight className="w-[1px] h-[1px]"/>
          </Button>
          <div className="lowercase flex items-center justify-center border-2 py-[5px] px-6 rounded-lg cursor-pointer"> 
            Learn More
          </div>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}

