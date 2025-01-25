import Image from 'next/image';
import Banner from '@/public/img/e-infra/header03.png';

export function TocFooter() {
   return (
     <div className="w-full flex justify-center">
        <Image src={Banner} alt="einfra banner" width="160" height="181"/>
     </div>
   );
}
