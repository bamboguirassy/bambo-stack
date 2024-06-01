import { Menu, Button, Popconfirm, Card } from "antd";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.png";
import { BookOutlined, DashboardOutlined, LogoutOutlined, SettingOutlined } from "@ant-design/icons";
import { catchError, removeToken } from "../../services/DaoService";
import UserService from "../../services/UserService";
import React from "react";
import Toast from "../../helpers/Toast";
import styles from "./Sidenav.module.scss";

function Sidenav({ color }) {
  const { pathname } = useLocation();
  const page = pathname.replace("/", "").split("/")[0];

  const [loggingOut, setLoggingOut] = React.useState(false);

  const menuItems = [
    {
      key: "dashboard",
      label: (
        <NavLink to="/dashboard">
          <span className={` ${page === "dashboard" ? styles.active : ""}`}>
             <DashboardOutlined /> 
          </span>
          <span className={styles.label}>Tableau de bord</span>
        </NavLink>
      ),
      path: "/dashboard",
    },
    {
      key: "parametrage",
      icon: (
        <span className={`${styles.icon} ${page === "parametrage" ? styles.active : ""}`}>
          <SettingOutlined />
        </span>
      ),
      label: "Paramétrage",
      children: [
        {
          key: 'groupes',
          label: <NavLink to="/parametrage/groupe">Groupes d'utilisateurs</NavLink>,
          path: '/parametrage/groupe'
        },
        {
          key: 'users',
          label: <NavLink to="/parametrage/user">Utilisateurs</NavLink>,
          path: '/parametrage/user'
        },
      ],
    },
  ];

  const openDocLink = () => {
    window.open("https://ant.design/components/overview", "_blank");
  }

  const logout = () => {
    setLoggingOut(true);
    UserService.getInstance()
    .logout()
    .then((response) => {
      Toast.success(response.message);
      removeToken();
      window.location.href = "/login";
    }).catch((error) => {
      catchError(error);
    }).finally(() => {
      setLoggingOut(false);
    });
  }

  return (
    <Card classNames={{body: "px-1"}} title={
      <div className={styles.brand}>
        <img src={logo} alt="" />
        <span className={styles.appName}>{process.env.REACT_APP_NAME}</span>
      </div>
    }>
      <Menu 
        defaultSelectedKeys={[page]} 
        defaultOpenKeys={[page]} 
        theme="light" 
        mode="inline" 
        items={menuItems} 
        className={styles.menu}
      />
      <div className="aside-footer px-1">
        <div
          className="footer-box"
          style={{
            background: color,
          }}
        >
          <h6>Besoin d'aide?</h6>
          <p>Consulter la documentation</p>
          <Button icon={<BookOutlined />} onClick={openDocLink} type="primary" className="ant-btn-sm ant-btn-block">
            DOCUMENTATION
          </Button>
          <Popconfirm title="Voulez-vous vraiment vous déconnecter?" onConfirm={logout} okText="Oui" cancelText="Non">
            <Button loading={loggingOut} icon={<LogoutOutlined />} type="default" className="ant-btn-sm ant-btn-block mt-1 bg-secondary text-white">
              DECONNEXION
            </Button>
          </Popconfirm>
        </div>
      </div>
    </Card>
  );
}

export default Sidenav;