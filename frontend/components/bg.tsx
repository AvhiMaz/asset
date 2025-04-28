"use client";

import { motion } from "framer-motion";
import React from "react";
import { AuroraBackground } from "../components/ui/aurora-background";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";

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
      <motion.div
        initial={{ opacity: 0.0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative min-h-screen w-full flex flex-col gap-4 items-center justify-center  lowercase"
      >
        <div className="text-4xl md:text-6xl dark:text-white text-center lowercase tracking-tighter">
          Lock asset in time, Deliver to the future
        </div>
        <div className="font-extralight text-md mx-10 lg:text-xl text-center tracking-tighter">
          Timeloop Vault lets you lock any digital asset on Solana and schedule its delivery to a recipient at a future date.
        </div>
        <div className="font-extralight text-md mx-10 lg:text-xl text-center tracking-tighter">
          lock a variety of assets, including:
        </div>

      <div className="flex flex-wrap justify-center gap-3 lg:gap-4">
        {assets.map((asset, index) => (
        <img
        key={index}
        src={asset.src}
        alt={asset.alt}
        className="w-12 lg:w-14 lg:h-14 object-contain"
      />
      ))}

      </div>
        <div className="flex gap-3 mt-6">
          <Button className="lowercase cursor-pointer ">
            Create Vault <ArrowRight className="w-[1px] h-[1px]"/>
          </Button>
          <div className="lowercase flex items-center justify-center border-2 py-1 px-6 rounded-lg cursor-pointer"> 
            Learn More
          </div>
        </div>

      </motion.div>
    </AuroraBackground>
  );
}

