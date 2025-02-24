import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import Logo from '@/public/img/e-infra/logo.svg';
import Banner from '@/public/img/ceritsc/banner.png';

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
       <Image src={Logo} alt="einfra logo" width="50" height="19"/>
       Documentation
     </>
    ),
  },
  links: [
    {
      type: 'menu',
      text: 'CERIT-SC Kubernetes',
      url: 'https://docs-ng.cerit.io/en/docs/platform/overview',
      items: [
        {
          menu: {
            banner: (
               <div className="-mx-3 -mt-3">
                <Image
                  src={Banner}
                  alt="Kubernetes"
                  width="1200"
                  height="710"
                  className="rounded-t-lg object-cover"
                  style={{
                    maskImage:
                      'linear-gradient(to bottom,white 60%,transparent)',
                  }}
                />
               </div>
            ),
            className: 'md:row-span-2',
          },
          text: 'Getting Started',
          description: 'Learn to use Kubernetes and services for your science',
          url: 'https://docs-ng.cerit.io/en/docs/platform/overview',
        },
        {
          // eslint-disable-next-line @next/next/no-img-element
	  icon: <img src="/img/ceritsc/menu-logos/jupyter-logo.svg" alt="jupyter logo" className="h-10 p-0.5"/>,
          text: 'JupyterHub',
          description: 'Run Jupyter notebooks at powerful hardware.',
          url: 'https://docs-ng.cerit.io/en/docs/web-apps/jupyterhub',
          menu: {
            className: 'lg:col-start-3 lg:row-start-2',
          },
        },
        {
          // eslint-disable-next-line @next/next/no-img-element
          icon: <img src="/img/ceritsc/menu-logos/rancher-logo.svg" alt="rancher logo" className="h-10 p-0.5"/>,
          text: 'Rancher',
          description: 'Use Rancher UI to access Kubernetes cluster.',
          url: 'https://docs-ng.cerit.io/en/docs/rancher/rancher',
          menu: {
            className: 'lg:col-start-2 lg:row-start-2',
          },
        },
        {
          // eslint-disable-next-line @next/next/no-img-element
          icon: <img src="/img/ceritsc/menu-logos/foldify-logo.svg" alt="foldify logo" className="h-10 p-0.5"/>,
          text: 'Foldify',
          description: 'Use web UI for protein prediction.',
          url: 'https://docs-ng.cerit.io/en/docs/web-apps/foldify',
          menu: {
            className: 'lg:col-start-3 lg:row-start-1',
          },
        },
        {
          // eslint-disable-next-line @next/next/no-img-element
          icon: <img src="/img/ceritsc/menu-logos/kubernetes-logo.svg" alt="kubernetes logo" className="h-10 p-0.5"/>,
          text: 'Cheapest managed Kubernetes',
          description: 'Use Kubernetes API in fully managed K8s platform.',
          url: 'https://docs-ng.cerit.io/en/docs/platform/overview',
          menu: {
            className: 'lg:col-start-2 lg:row-start-1',
          },
        },
      ], 
    },
    {
      text: 'DU CESNET',
      url: 'https://docs.du.cesnet.cz',
      active: 'nested-url',
    },
    {
      text: 'IT4I',
      url: 'https://docs.it4i.cz',
      active: 'nested-url',
    },
    {
      text: 'Metacentrum',
      url: 'https://docs.metacentrum.cz',
      active: 'nested-url',
    },
    { 
      text: 'NRP',
      url: 'https://docs.nrp.eosc.cz',
      active: 'nested-url',
    }
  ],
  disableThemeSwitch: true,
};
