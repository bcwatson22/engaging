"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  name: string;
};

const getRandomNumber = (times = 400): number => Math.random() * times;

const Skill = ({ name }: Props) => {
  const [x, setX] = useState(Math.random() * 400);
  const [y, setY] = useState(Math.random() * 400);

  console.log({ x, y });

  return (
    <motion.div
      className="skill"
      animate={{ x, y }}
      transition={{
        ease: "linear",
        duration: 2,
        repeat: Infinity,
      }}
      onAnimationComplete={() => {
        setX(Math.random() * 400);
        setY(Math.random() * 400);
      }}
    >
      <span>{name}</span>
    </motion.div>
  );
};

export { Skill };
