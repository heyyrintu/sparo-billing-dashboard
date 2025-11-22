'use client'

import React, { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Sidebar, SidebarBody, SidebarLink } from '@/components/ui/sidebar'
import { IconPackage, IconTrendingUp, IconChartBar, IconUpload, IconLayoutDashboard, IconSettings, IconFileInvoice } from '@tabler/icons-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface AppSidebarProps {
  activeTab?: 'inbound' | 'outward' | 'revenue' | 'operations'
  onTabChange?: (tab: 'inbound' | 'outward' | 'revenue' | 'operations') => void
}

export function AppSidebar({ activeTab, onTabChange }: AppSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const isUploadPage = pathname === '/upload'
  const isDashboardPage = pathname === '/'
  const isOperationsPage = pathname === '/operations'
  const isBillingPage = pathname === '/billing'
  
  const dashboardLink = {
    label: 'Dashboard',
    href: '/',
    icon: (
      <IconLayoutDashboard className={cn(
        "h-5 w-5 shrink-0",
        isDashboardPage ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'
      )} />
    ),
  }
  
  const links = [
    {
      label: 'Inbound',
      href: '/',
      icon: (
        <IconPackage className={cn(
          "h-5 w-5 shrink-0",
          activeTab === 'inbound' ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'
        )} />
      ),
      tab: 'inbound' as const,
    },
    {
      label: 'Outward',
      href: '/',
      icon: (
        <IconTrendingUp className={cn(
          "h-5 w-5 shrink-0",
          activeTab === 'outward' ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'
        )} />
      ),
      tab: 'outward' as const,
    },
    {
      label: 'Revenue',
      href: '/',
      icon: (
        <IconChartBar className={cn(
          "h-5 w-5 shrink-0",
          activeTab === 'revenue' ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'
        )} />
      ),
      tab: 'revenue' as const,
    },
    {
      label: 'Operations',
      href: '/operations',
      icon: (
        <IconSettings className={cn(
          "h-5 w-5 shrink-0",
          isOperationsPage ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'
        )} />
      ),
      tab: 'operations' as const,
    },
  ]

  const billingLink = {
    label: 'Billing',
    href: '/billing',
    icon: (
      <IconFileInvoice className={cn(
        "h-5 w-5 shrink-0",
        isBillingPage ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'
      )} />
    ),
  }

  const uploadLink = {
    label: 'Upload',
    href: '/upload',
    icon: (
      <IconUpload className={cn(
        "h-5 w-5 shrink-0",
        isUploadPage ? 'text-white' : 'text-neutral-700 dark:text-neutral-200'
      )} />
    ),
  }

  const [open, setOpen] = useState(false)

  const handleLinkClick = (link: typeof links[0]) => {
    if (link.tab === 'operations') {
      router.push('/operations')
      if (onTabChange) {
        onTabChange('operations')
      }
    } else if (link.tab && onTabChange) {
      onTabChange(link.tab)
      if (pathname !== '/') {
        router.push('/')
      }
    }
  }

  const handleUploadClick = () => {
    router.push('/upload')
  }

  const handleDashboardClick = () => {
    router.push('/')
    if (onTabChange) {
      // Reset to default tab when going to dashboard
      onTabChange('revenue')
    }
  }

  const handleBillingClick = () => {
    router.push('/billing')
  }

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-10">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {open ? <Logo /> : <LogoIcon />}
          <div className="mt-8 flex flex-col gap-2">
            {links.map((link, idx) => (
              <SidebarLink
                key={idx}
                link={link}
                onClick={() => handleLinkClick(link)}
                className={cn(
                  "rounded-lg px-3 transition-colors",
                  (activeTab === link.tab || (link.tab === 'operations' && isOperationsPage))
                    ? "bg-gradient-to-r from-[#E01E1F] to-[#FEA519] text-white font-bold" 
                    : "hover:bg-gray-200 dark:hover:bg-neutral-700"
                )}
              />
            ))}
          </div>
        </div>
        <div className="mt-auto flex flex-col gap-2">
          <SidebarLink
            link={billingLink}
            onClick={handleBillingClick}
            className={cn(
              "rounded-lg px-3 transition-colors",
              isBillingPage
                ? "bg-gradient-to-r from-[#E01E1F] to-[#FEA519] text-white font-bold" 
                : "hover:bg-gray-200 dark:hover:bg-neutral-700"
            )}
          />
          <SidebarLink
            link={dashboardLink}
            onClick={handleDashboardClick}
            className={cn(
              "rounded-lg px-3 transition-colors",
              isDashboardPage
                ? "bg-gradient-to-r from-[#E01E1F] to-[#FEA519] text-white font-bold" 
                : "hover:bg-gray-200 dark:hover:bg-neutral-700"
            )}
          />
          <SidebarLink
            link={uploadLink}
            onClick={handleUploadClick}
            className={cn(
              "rounded-lg px-3 transition-colors",
              isUploadPage
                ? "bg-gradient-to-r from-[#E01E1F] to-[#FEA519] text-white font-bold" 
                : "hover:bg-gray-200 dark:hover:bg-neutral-700"
            )}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  )
}

export const Logo = () => {
  const router = useRouter()
  
  return (
    <a
      href="/"
      onClick={(e) => {
        e.preventDefault()
        router.push('/')
      }}
      className="relative z-20 flex items-center space-x-2 py-1 text-sm font-normal text-black cursor-pointer"
    >
      <img
        src="https://cdn.dribbble.com/userupload/45188200/file/49510167ef68236a40dd16a5212e595e.png?resize=400x400&vertical=center"
        alt="Spario Logo"
        className="h-12 w-12 shrink-0 object-contain"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium whitespace-pre text-black dark:text-white"
      >
        Spario Dashboard
      </motion.span>
    </a>
  )
}

export const LogoIcon = () => {
  const router = useRouter()
  
  return (
    <a
      href="/"
      onClick={(e) => {
        e.preventDefault()
        router.push('/')
      }}
      className="relative z-20 flex items-center justify-center py-1 text-sm font-normal text-black w-full cursor-pointer"
    >
      <img
        src="https://cdn.dribbble.com/userupload/45188200/file/49510167ef68236a40dd16a5212e595e.png?resize=400x400&vertical=center"
        alt="Spario Logo"
        className="h-12 w-12 shrink-0 object-contain"
      />
    </a>
  )
}

