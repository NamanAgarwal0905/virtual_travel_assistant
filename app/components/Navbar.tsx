'use client';
import React, { useState } from "react";
import { HoveredLink, Menu, MenuItem, ProductItem } from "./ui/navbar-menu";
import { cn } from "../utils/cn";
import Link from "next/link";
const Navbar = ({ className }: { className?: string }) => {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className={cn("fixed top-8 inset-x-0 max-w-full mx-auto z-50 px-10", className)}>
      <Menu setActive={setActive}>
           
           <Link href={"/"}>
              <MenuItem setActive={setActive} active={active} item="Home">
              </MenuItem>
           </Link>
           <Link href={"/About-Us"}>
              <MenuItem setActive={setActive} active={active} item="About Us">
              </MenuItem>
           </Link>
           <Link href={"/Contact-Us"}>
              <MenuItem setActive={setActive} active={active} item="Contact Us">
              </MenuItem>
           </Link>
           <Link href={"/Login"} >
           <MenuItem setActive={setActive} active={active} item="Login">
           </MenuItem>
           </Link>
      </Menu>
      
    </div>
  )
}

export default Navbar 