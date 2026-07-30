"use client";

import * as React from "react";
import { Accordion } from "@base-ui/react";
import { cn } from "@/lib/utils";

const AccordionRoot = React.forwardRef<
  React.ComponentRef<typeof Accordion.Root>,
  React.ComponentProps<typeof Accordion.Root>
>(({ className, ...props }, ref) => (
  <Accordion.Root ref={ref} className={cn("w-full", className)} {...props} />
));
AccordionRoot.displayName = "AccordionRoot";

const AccordionItem = React.forwardRef<
  React.ComponentRef<typeof Accordion.Item>,
  React.ComponentProps<typeof Accordion.Item>
>(({ className, ...props }, ref) => (
  <Accordion.Item ref={ref} className={cn("border-b", className)} {...props} />
));
AccordionItem.displayName = "AccordionItem";

const AccordionTrigger = React.forwardRef<
  React.ComponentRef<typeof Accordion.Trigger>,
  React.ComponentProps<typeof Accordion.Trigger>
>(({ className, children, ...props }, ref) => (
  <Accordion.Trigger
    ref={ref}
    className={cn(
      "flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline [&[data-panel-open]>svg]:rotate-180",
      className
    )}
    {...props}
  >
    {children}
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4 shrink-0 transition-transform duration-200"
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  </Accordion.Trigger>
));
AccordionTrigger.displayName = "AccordionTrigger";

const AccordionContent = React.forwardRef<
  React.ComponentRef<typeof Accordion.Panel>,
  React.ComponentProps<typeof Accordion.Panel>
>(({ className, children, ...props }, ref) => (
  <Accordion.Panel
    ref={ref}
    className="overflow-hidden text-sm transition-all data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn("pb-4 pt-0", className)}>{children}</div>
  </Accordion.Panel>
));
AccordionContent.displayName = "AccordionContent";

export { AccordionRoot as Accordion, AccordionItem, AccordionTrigger, AccordionContent };
