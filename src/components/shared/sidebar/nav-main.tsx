"use client";

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import { ChevronRight, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconType } from "react-icons";

export function NavMain({
  items,
}: {
  items: {
    title: string;
    url: string;
    icon?: LucideIcon | IconType;
    isActive?: boolean;
    items?: {
      title: string;
      icon?: LucideIcon | IconType;
      url: string;
    }[];
  }[];
}) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items?.map((item) => {
          const isActive = item.isActive || pathname === item.url;

          // Items with sub-items
          if (item.items && item.items.length > 0) {
            return (
              <Collapsible
                key={item.title}
                asChild
                defaultOpen={isActive}
                className="group/collapsible"
              >
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                      tooltip={item.title}
                      className={`border rounded-xl transition-all duration-200 ${
                        isActive
                          ? "bg-[#00224A] text-white border-[#00224A] hover:bg-[#00224A]/90 hover:text-white"
                          : "text-[#00224A] bg-white border-gray-200 hover:border-[#00224A]/20 hover:bg-[#00224A]/5 hover:text-[#00224A]"
                      }`}
                    >
                      {item.icon && (
                        <item.icon className="mr-2 h-5 w-5" />
                      )}

                      <span>{item.title}</span>

                      <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="bg-white">
                    <SidebarMenuSub>
                      {item.items.map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton
                            asChild
                            className={`border rounded-lg transition-all duration-200 ${
                              pathname === subItem.url
                                ? "bg-[#EC620B]/10 text-[#EC620B] border-[#EC620B]/20"
                                : "text-[#00224A] border-gray-200 hover:border-[#00224A]/20 hover:bg-[#00224A]/5 hover:text-[#00224A]"
                            }`}
                          >
                            <Link href={subItem.url}>
                              {subItem.icon && (
                                <subItem.icon className="mr-2 h-5 w-5" />
                              )}

                              <span className="font-medium">
                                {subItem.title}
                              </span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>
            );
          }

          // Simple navigation item
          return (
            <SidebarMenuItem
              key={item.title}
              className="py-1"
            >
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                className={`border rounded-xl transition-all duration-200 ${
                  isActive
                    ? "bg-[#EC620B] text-white border-[#EC620B] shadow-sm hover:bg-[#EC620B]/90 hover:text-white"
                    : "text-[#00224A] bg-white border-gray-200 hover:border-[#00224A]/20 hover:bg-[#00224A]/5 hover:text-[#00224A]"
                } py-6`}
              >
                <Link href={item.url}>
                  {item.icon && (
                    <item.icon className="mr-2 h-7 w-7" />
                  )}

                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}