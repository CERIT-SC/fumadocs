import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';

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
       <img src="/img/e-infra/logo.svg" width="50"/>
       Documentation
     </>
    ),
  },
  links: [
    {
      type: 'menu',
      text: 'CERIT-SC Kubernetes',
      url: '/docs/platform/overview',
      items: [
        {
          menu: {
            banner: (
               <div className="-mx-3 -mt-3">
                <img
                  src="/img/ceritsc/banner.jpeg"
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
          url: '/docs/platform/overview',
        },
        {
	  icon: <img src="https://upload.wikimedia.org/wikipedia/commons/3/38/Jupyter_logo.svg" className="h-12"/>,
          text: 'JupyterHub',
          description: 'Run Jupyter notebooks at powerful hardware.',
          url: '/docs/web-apps/jupyterhub',
          menu: {
            className: 'lg:col-start-2',
          },
        },
        {
          icon: <img src="https://www.rancher.com/assets/img/logos/rancher-suse-logo-horizontal-color.svg" className="h-12"/>,
          text: 'Rancher',
          description: 'User Rancher UI to access Kubernetes cluster.',
          url: '/docs/rancher/rancher',
          menu: {
            className: 'lg:col-start-2',
          },
        },
        {
          icon: <img src="https://foldify.cloud.e-infra.cz/_next/image?url=%2F_next%2Fstatic%2Fmedia%2Ffoldify-logo.de502c5a.png&w=384&q=75" className="h-12"/>,
          text: 'Foldify',
          description: 'Use web UI for protein prediction.',
          url: '/docs/web-apps/foldify',
          menu: {
            className: 'lg:col-start-3 lg:row-start-1',
          },
        },
        {
          icon: <img src="https://bizanosa.com/wp-content/uploads/2022/06/36-Cheapest-managed-Kubernetes-hosting-1024x576.png" className="h-12"/>,
          text: 'Kubernetes API',
          description: 'User Kubernetes API in fully managed K8s platform.',
          url: '/docs/platform/overview',
          menu: {
            className: 'lg:col-start-3',
          },
        },
      ], 
    },
    {
      text: 'DU Cesnet',
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
  sidebar: {
    defaultOpenLevel: 1,
  },
};
