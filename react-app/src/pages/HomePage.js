import React from "react";

import {
  Card,
  Result,
} from "antd";
import Main from "../components/layout/Main";
import { useUserContext } from "../providers/UserProvider";
import UnauthorizedMessage from "../components/utils/UnauthorizedMessage";




function HomePage() {
  const { check } = useUserContext();

  return (
    <Main>
      <Card title="Page d'accueil - Dashboard" className="full-height" classNames={{ body: "px-0" }}>
        {check('VIEW-DASHBOARD') ?
          (
            <div className="layout-content">
              <Result
                status="success"
                title="Bienvenue sur la plateforme full Stack PLR (Pusher, Laravel, React) dénommé 'Bambo Stack' développé comme prototype pour toute mise en place de projet rapide."
                subTitle="Vous pouvez naviguer dans le menu pour accéder aux différentes fonctionnalités."
              />
            </div>
          ) : (
            <Result status="403" title="403" subTitle="Désolé, vous n'êtes pas autorisé à accéder à cette page." extra={<UnauthorizedMessage />} />
          )}
      </Card>
    </Main>
  );
}

export default HomePage;
