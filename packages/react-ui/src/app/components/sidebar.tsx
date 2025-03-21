import { QuestionMarkCircledIcon } from '@radix-ui/react-icons';
import { t } from 'i18next';
import { FileTextIcon, LockKeyhole } from 'lucide-react';
import React from 'react';
import { Link, useLocation } from 'react-router-dom';

import { useEmbedding } from '@/components/embed-provider';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useAuthorization } from '@/hooks/authorization-hooks';
import { flagsHooks } from '@/hooks/flags-hooks';
import { cn, determineDefaultRoute } from '@/lib/utils';
import { ApFlagId, supportUrl } from '@activepieces/shared';

import { ShowPoweredBy } from '../../components/show-powered-by';
import { platformHooks } from '../../hooks/platform-hooks';

import { Header } from './header';

type Link = {
  icon: React.ReactNode;
  label: string;
  to: string;
  notification?: boolean;
};

type CustomTooltipLinkProps = {
  to: string;
  label: string;
  Icon: React.ElementType;
  extraClasses?: string;
  notification?: boolean;
  locked?: boolean;
  newWindow?: boolean;
  isActive?: (pathname: string) => boolean;
};
const CustomTooltipLink = ({
  to,
  label,
  Icon,
  extraClasses,
  notification,
  locked,
  newWindow,
  isActive,
}: CustomTooltipLinkProps) => {
  const location = useLocation();

  const isLinkActive =
    location.pathname.startsWith(to) || isActive?.(location.pathname);
  return (
    <Link
      to={to}
      target={newWindow ? '_blank' : ''}
      rel={newWindow ? 'noopener noreferrer' : ''}
    >
      <div
        className={`relative flex flex-col items-center justify-center gap-1`}
      >
        {locked && (
          <LockKeyhole
            className="absolute right-[-1px] bottom-[20px] size-3"
            color="grey"
          />
        )}
        <Icon
          className={`size-10 p-2.5 hover:text-primary rounded-lg transition-colors ${
            isLinkActive ? 'bg-accent text-primary' : ''
          } ${extraClasses || ''}`}
        />
        <span className="text-[10px]">{label}</span>
        {notification && (
          <span className="bg-destructive absolute right-[1px] top-[3px] size-2 rounded-full"></span>
        )}
      </div>
    </Link>
  );
};

export type SidebarLink = {
  to: string;
  label: string;
  icon: React.ElementType;
  notification?: boolean;
  locked?: boolean;
  hasPermission?: boolean;
  showInEmbed?: boolean;
  isActive?: (pathname: string) => boolean;
};

type SidebarProps = {
  children: React.ReactNode;
  links: SidebarLink[];
  isHomeDashboard?: boolean;
  hideSideNav?: boolean;
};
export function Sidebar({
  children,
  links,
  isHomeDashboard = false,
  hideSideNav = false,
}: SidebarProps) {
  const branding = flagsHooks.useWebsiteBranding();
  const { data: showSupportAndDocs } = flagsHooks.useFlag<boolean>(
    ApFlagId.SHOW_COMMUNITY,
  );
  const { embedState } = useEmbedding();
  const { platform } = platformHooks.useCurrentPlatform();
  const defaultRoute = determineDefaultRoute(useAuthorization().checkAccess);
  return (
    <div>
      <div className="flex min-h-screen w-full  ">
        {!hideSideNav && (
          <aside className=" border-r sticky  top-0 h-screen bg-muted/50 w-[65px] ">
            <ScrollArea>
              <nav className="flex flex-col items-center h-screen  sm:py-5  gap-5 p-2 ">
                <Link
                  to={isHomeDashboard ? defaultRoute : '/platform'}
                  className="h-[48px] items-center justify-center "
                >
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <img
                        src={branding.logos.logoIconUrl}
                        alt={t('home')}
                        width={28}
                        height={28}
                      />
                    </TooltipTrigger>
                    <TooltipContent side="right">{t('Home')}</TooltipContent>
                  </Tooltip>
                </Link>

                <a rel="" onClick={() => window.location.href = "http://localhost:4173/"}  ><div className="relative flex flex-col items-center justify-center gap-1"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-home "><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg><span className="text-[10px]">Home</span></div></a>

                {links.map((link, index) => (
                  <CustomTooltipLink
                    to={link.to}
                    label={link.label}
                    Icon={link.icon}
                    key={index}
                    notification={link.notification}
                    locked={link.locked}
                    isActive={link.isActive}
                  />
                ))}

                <div className="grow"></div>
              </nav>
            </ScrollArea>
          </aside>
        )}
        <div className="flex-1 p-4">
          <div className="flex flex-col">
            <Header />
            <div
              className={cn('container mx-auto flex py-10 px-2', {
                'py-4': embedState.isEmbedded,
              })}
            >
              {children}
            </div>
          </div>
        </div>
      </div>
      <ShowPoweredBy show={platform?.showPoweredBy && isHomeDashboard} />
    </div>
  );
}
