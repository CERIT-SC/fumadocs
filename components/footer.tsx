import React from "react";
import Link from "next/link";
import { Clock, Mail, Phone } from "lucide-react";
import RedirectListItem from "./redirection/redirect-list-item";

const Version = Date.now();

const Footer: React.FC = () => {
  return (
    <footer className="flex flex-col mt-0 md:mt-12 items-center p-5 bg-gray-100 border-t border-gray-300 pb-5">
      <div className="container md:flex sm:flex-row  justify-between gap-5 items-center mb-8 max-w-[1100px]">
        <div className="flex-1 px-2 mt-8 justify-center">
          <h4 className="font-semibold mb-3">e-INFRA CZ</h4>
          <ul>
            <li>
              <p className="text-sm text-fd-muted-foreground">
                <span className="whitespace-nowrap">CERIT-SC</span>,{" "}
                <span className="whitespace-nowrap">CESNET</span>, and{" "}
                <span className="whitespace-nowrap">IT4Innovations</span> are
                the three{" "}
                <span className="whitespace-nowrap">e-infrastructures</span>{" "}
                that constitute the national{" "}
                <span className="whitespace-nowrap">e-INFRA CZ</span> research
                infrastructure.
              </p>
            </li>
          </ul>
        </div>
        <div className="flex-1 mt-8 px-2">
          <h4 className="font-semibold mb-2">General information</h4>
          <ul>
            <RedirectListItem
              href="https://blog.e-infra.cz/"
              text="e-INFRA CZ Blog"
            />
            <RedirectListItem
              href="https://e-infra.cz/"
              text="e-INFRA CZ Website"
            />
            <RedirectListItem
              href="https://docs.e-infra.cz/account/mfa/setup"
              text="Documentation on Github"
            />
          </ul>
        </div>
        <div className="flex-1 px-2 mt-8 h-full">
          <h4 className="font-semibold mb-2">e-INFRA CZ Support</h4>
          <ul>
            <li className="flex items-center gap-2">
              <Clock className="w-4 pt-[2px] h-4 text-fd-primary" />
              <p className="text-fd-muted-foreground">Available non-stop</p>
            </li>
            <li className="flex pt-[2px] items-center gap-2">
              <Mail className="w-4 h-4 text-fd-primary" />
              <Link
                href="mailto:support@e-infra.cz"
                className="text-fd-primary hover:underline"
              >
                support@e-infra.cz
              </Link>
            </li>
            <li className="flex pt-[2px] items-center gap-2">
              <Phone className="w-4 h-4 text-fd-primary" />
              <p className="text-fd-muted-foreground">+420 234 680 222</p>
            </li>
          </ul>
        </div>
      </div>

      <div className="container md:flex sm:flex-row sm:mt-8 justify-center items-center gap-4 mt-8 max-w-[1100px] rounded-md bg-slate-100">
        <img
          src="/img/logos/footer-partner-logos.svg"
          alt="CESNET Logo"
          className="h-14 w-auto"
        />
      </div>
      <hr className="mt-8 mb-4 border-t-2 border-gray-200 w-full" />
      <div className="container md:flex sm:flex-row justify-center md:justify-between items-center max-w-[1100px]">
        <div className="flex items-center justify-center md:justify-start gap-1">
          <p className="text-sm text-fd-muted-foreground">
            Copyright © 2025 e-INFRA CZ
          </p>
          <p className="text-sm text-fd-muted-foreground px-1 pb-[1px]">|</p>
          <Link
            href="https://www.e-infra.cz/en/personal-data-processing"
            className="text-sm text-fd-primary hover:underline"
          >
            Privacy Policy
          </Link>
        </div>
        <div className="flex items-center justify-center md:justify-end gap-1 pt-4 md:pt-0">
          <p className="text-sm text-fd-muted-foreground">
            Version: {new Date(Version).toLocaleDateString("cs-CS")}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
