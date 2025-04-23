import type { BaseLayoutProps } from "fumadocs-ui/layouts/shared";
import Image from "next/image";
import Logo from "@/public/img/e-infra/logo.svg";
import Footer from "@/components/footer";

/**
 * Shared layout configurations
 *
 * you can configure layouts individually from:
 * Home Layout: app/(home)/layout.tsx
 * Docs Layout: app/docs/layout.tsx
 */
export const baseOptions: BaseLayoutProps = {
  i18n: true,
  nav: {
    title: (
      <>
        <Image src={Logo} alt="einfra logo" width="50" height="19" />
        Documentation
      </>
    ),
    url: "https://docs.e-infra.cz/",
  },
  links: [],
  disableThemeSwitch: true,
  themeSwitch: { enabled: false },
};
