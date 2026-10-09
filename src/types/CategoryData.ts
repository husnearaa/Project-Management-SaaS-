import Plumbing from "@/assets/categories/plumbing.png"
import Electrical from "@/assets/categories/electrical.png"
import Cleaning from "@/assets/categories/cleaning.png"
import Painting from "@/assets/categories/painting-a-wall.png"
import AC from "@/assets/categories/air-conditioner.png"


export const categoriesData = [{
title: "Plumbing",
    description: "Pipes, leaks, faucets & repairs",
    imageSrc: Plumbing.src,
    borderColor: "border-amber-600/30",
    buttonColor: "bg-amber-600",
    backgroundColor: "bg-[#222227]",
  },
  {
    title: "Electrical",
    description: "Wiring, lighting & electrical work",
    imageSrc: Electrical.src,
    borderColor: "border-teal-800/30",
    buttonColor: "bg-orange-400",
    backgroundColor: "bg-[#132c30]",
  },
  {
    title: "Cleaning",
    description: "Home, deep & regular cleaning",
    imageSrc: Cleaning.src,
    borderColor: "border-indigo-900/30",
    buttonColor: "bg-amber-600",
    backgroundColor: "bg-[#20213c]",
  },
  {
    title: "Painting",
    description: "Interior & exterior painting",
    imageSrc: Painting.src,
    borderColor: "border-red-900/30",
    buttonColor: "bg-amber-600",
    backgroundColor: "bg-[#28202e]",
  },
  {
      title: "AC & HVAC",
    description: "Repair, installation & maintenance",
    imageSrc: AC.src,
    borderColor: "border-red-900/30",
    buttonColor: "bg-amber-600",
    backgroundColor: "bg-[#28202e]",
  }
]



