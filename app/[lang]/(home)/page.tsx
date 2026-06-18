import { Fingerprint, Cpu, Database, MoveRight } from 'lucide-react'; 
import { Card } from 'fumadocs-ui/components/card';

export default function HomePage() {
  return (
    <div className="relative flex min-h-150 mx-auto w-full max-w-350">
      <div className="flex flex-col z-2 px-4 size-full md:p-12 max-md:items-center max-md:text-center">
        <h1 className="mb-4 text-2xl font-bold">Welcome to e-INFRA CZ Documentation!</h1>
        <p className="text-fd-muted-foreground">
        The home for documentation of all e-INFRA CZ services that are provided to scientific community in the Czech Republic.
        </p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 pt-4">
          <Card title="e-INFRA CZ Account" icon={<Fingerprint/>}>
            <p>Start by setting up your <b>e-INFRA CZ Account</b>, which will give you access to all services.</p>
            <ul className="pt-2">
            <li><a href="https://docs.e-infra.cz/account/creation" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Account creation</a></li>
            <li><a href="https://docs.e-infra.cz/account/access" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Accessing your account and services</a></li>
            <li><a href="https://docs.e-infra.cz/account/management/" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Account settings</a></li>
            <li><a href="https://docs.e-infra.cz/account/mfa/setup" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Multi-Factor Authentication</a></li>
            </ul>
          </Card>
          <Card title="Data Processing" icon={<Cpu />}>
            <p>Focus on what&apos;s important, your research can be accelerated with our <b>big</b> servers.</p>
            <ul className="pt-2">
            <li><a href="https://docs.metacentrum.cz/" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Batch computing (Metacentrum Grid)</a></li>
            <li><a href="https://docs.e-infra.cz/compute/openstack/" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Compute Cloud (Virtualization)</a></li>
            <li><a href="https://docs.cerit.io/en/platform/overview" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Containers Cloud</a></li>
            <li><a href="https://docs.it4i.cz/" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Supercomputing</a></li>
            <li><a href="https://www.cerit-sc.cz/infrastructure-services/sensitivecloud" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Sensitive data processing</a></li>
            </ul>
          </Card>
          <Card title="Data Storage & Repositories" icon={<Database />}>
            <p>Need to store <b>terabytes</b> of data? No problem. Read what capabilities you have.</p>
            <ul className="pt-2">
            <li><a href="https://docs.du.cesnet.cz/" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Overview</a></li>
            <li><a href="https://docs.du.cesnet.cz/" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Synchronisation&Sharing</a></li>
            <li><a href="https://docs.du.cesnet.cz/en/object-storage-s3/s3-service" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Object Storage</a></li>
            <li><a href="https://docs.nrp.eosc.cz/" className="text-fd-primary flex items-center gap-2 hover:underline"><MoveRight /> Data Repositories</a></li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
