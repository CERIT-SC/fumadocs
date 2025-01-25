import { Cards3, Card } from '@/components/card3';
import { Fingerprint, Cpu, Database, MoveRight } from 'lucide-react'; 

export default function HomePage() {
  return (
    <main className="container relative max-w-[1100px] px-2 py-4 lg:py-16">
      <h1 className="mb-4 text-2xl font-bold">Welcome to e-INFRA CZ Documentation!</h1>
      <p className="text-fd-muted-foreground">
      The home for documentation of all e-INFRA CZ services that are provided to scientific community in the Czech Republic.
      </p>
      <Cards3 className="pt-4">
        <Card title="e-INFRA CZ Account" icon={<Fingerprint/>}>
          <p>Start by setting up your <b>e-INFRA CZ Account</b>, which will give you access to all services.</p>
	  <ul className="pt-2">
           <li><a href="https://docs.e-infra.cz/account/creation" className="text-fd-primary flex items-center gap-2"><MoveRight /> Account creation</a></li>
           <li><a href="https://docs.e-infra.cz/account/access" className="text-fd-primary flex items-center gap-2"><MoveRight /> Accessing your account and services</a></li>
           <li><a href="https://docs.e-infra.cz/account/management/" className="text-fd-primary flex items-center gap-2"><MoveRight /> Account settings</a></li>
           <li><a href="https://docs.e-infra.cz/account/mfa/setup" className="text-fd-primary flex items-center gap-2"><MoveRight /> Multi-Factor Authentication</a></li>
          </ul>
        </Card>
        <Card title="Data Processing" icon={<Cpu />}>
          <p>Focus on what&apos;s important, your research can be accelerated with our <b>big</b> servers.</p>
        </Card>
        <Card title="Data Management & Storage" icon={<Database />}>
          <p>Need to store <b>terabytes</b> of data? No problem. Read what capabilities you have.</p>
        </Card>
      </Cards3>
    </main>
  );
}
