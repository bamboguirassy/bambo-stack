import React from "react";
import {
  Layout,
  Button,
  Row,
  Col,
  Typography,
  Form,
  Input,
  Switch,
} from "antd";
import logosenegal from "../assets/images/flag_senegal.png";
import UserService from "../services/UserService";
import { catchError, storeToken } from "../services/DaoService";
import Toast from "../helpers/Toast";
import { useNavigate } from "react-router-dom";
import { useUserContext } from "../providers/UserProvider";
const { Title } = Typography;
const { Footer, Content } = Layout;

function onChange(checked) {
  console.log(`switch to ${checked}`);
}

export default function LoginPage() {
  const [loading, setLoading] = React.useState(false);
  const [step, setStep] = React.useState(1);
  const [uid, setUid] = React.useState(null);
  const navigate = useNavigate();
  const { setCurrentUser, currentUser } = useUserContext();

  const onFinish = (values) => {
    setLoading(true);
    UserService.getInstance()
      .login(values)
      .then((response) => {
        setLoading(false);
        if (response.message) {
          Toast.success(response.message);
        }
        setUid(response.data.uid);
        setStep(2);
      }).catch((error) => {
        catchError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const onCodeFormFinish = (values) => {
    setLoading(true);
    const data = {
      ...values,
      uid: uid
    }
    UserService.getInstance()
      .verifyOneTimePassword(data)
      .then((response) => {
        setLoading(false);
        if (response.data.message) {
          Toast.success(response.message);
        }
        storeToken(response.data.token);
        if (response.message) {
          Toast.success(response.message);
        }
        // rediriger vers la page d'accueil
        // window.location.href = "/dashboard";
        setCurrentUser(response.data.user);
      }).catch((error) => {
        catchError(error);
      })
      .finally(() => {
        setLoading(false);
      });
  }

  React.useEffect(() => {
    if (currentUser) {
      navigate('/dashboard');
    }
  }, [currentUser, navigate]);

  const OnCodeFormFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  }

  const handleForgotPassword = () => {
    console.log("forgot");
    navigate(`/forgot-password`);
  };

  return (
    <>
      <Layout className="layout-default layout-signin">
        <Content className="signin">
          <Row gutter={[24, 0]} justify="center">
            <Col xs={24} lg={8} md={12}>
              <img className="app-logo" src={logosenegal} alt="" />
            </Col>
          </Row>
          <Row gutter={[24, 0]} justify="space-around">
            <Col
              xs={{ span: 24 }}
              lg={{ span: 8 }}
              md={{ span: 12 }}
            >
              <Title className="mb-15">Connexion</Title>
              <Title className="font-regular text-muted" level={5}>
                Connectez-vous pour accéder à votre compte
              </Title>
              {step === 1 ? (
                <Form
                  onFinish={onFinish}
                  onFinishFailed={onFinishFailed}
                  layout="vertical"
                  className="row-col"
                >
                  <Form.Item
                    className="username"
                    label="Email"
                    name="email"
                    rules={[
                      {
                        required: true,
                        message: "Renseignez votre email!",
                      },
                      {
                        type: "email",
                        message: "Email invalide!",
                      },
                    ]}
                  >
                    <Input placeholder="Email" />
                  </Form.Item>

                  <Form.Item
                    className="username"
                    label="Password"
                    name="password"
                    rules={[
                      {
                        required: true,
                        message: "Renseignez votre mot de passe!",
                      },
                    ]}
                  >
                    <Input type="password" placeholder="Password" />
                  </Form.Item>

                  <Form.Item
                    name="remember"
                    className="aligin-center"
                    valuePropName="checked"
                  >
                    <Switch defaultChecked onChange={onChange} />
                    <span className="text-muted">Se souvenir de moi</span>
                  </Form.Item>

                  <Form.Item>
                    <Button loading={loading}
                      type="primary"
                      htmlType="submit"
                      style={{ width: "100%" }}
                    >
                      Connexion
                    </Button>
                  </Form.Item>
                  <Form.Item>
                    <Button
                      type="link"
                      onClick={handleForgotPassword}
                      style={{ padding: 0, color: "green", textAlign: "right" }}
                      className="small-text"
                    >
                      Mot de passe oublié ?
                    </Button>
                  </Form.Item>
                </Form>) : (
                // formulaire pour le code de vérification
                <Form onFinish={onCodeFormFinish} onFinishFailed={OnCodeFormFailed} layout="vertical" className="row-col">
                  <Form.Item
                    className="username"
                    label="Code de vérification"
                    name="otp"
                    rules={[
                      {
                        required: true,
                        message: "Renseignez le code de vérification!",
                      },
                      {
                        min: 6,
                        message: "Le code de vérification doit contenir 6 caractères!"
                      },
                      {
                        max: 6,
                        message: "Le code de vérification doit contenir 6 caractères!"
                      }
                    ]}
                  >
                    <Input placeholder="Code de vérification" />
                  </Form.Item>
                  <Form.Item>
                    <Button loading={loading}
                      type="primary"
                      htmlType="submit"
                      style={{ width: "100%" }}
                    >
                      Valider
                    </Button>
                  </Form.Item>
                </Form>
              )}
            </Col>
          </Row>
        </Content>
        <Footer>
          <p className="copyright">
            {" "}
            Copyright © {
              new Date().getFullYear()
            }{" "} Prime by <a href="https://terangagroup.net">Teranga Cloud Solutions</a>{" "}
          </p>
        </Footer>
      </Layout>
    </>
  );
}
