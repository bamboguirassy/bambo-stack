import React from "react";
import {Layout,Row, Col,Typography,Form, Input, Button, Result} from "antd";
import logosenegal from "../../assets/images/logo.png";
import UserService from "../../services/UserService";
import { catchError } from "../../services/DaoService";
import { useNavigate } from "react-router-dom";
const { Title } = Typography;
const { Footer, Content } = Layout;
const { Text } = Typography;

export default function ForgotPasswordPage(){
    const [loading, setLoading] = React.useState(false);
    const [mailSended, setMailSended] = React.useState(false);
    const [message, setMessage] = React.useState('');
    const navigate = useNavigate();

    const onFinish = (values) => {
        setLoading(true);
        UserService.getInstance()
          .forgotPassword(values)
          .then((response) => {
            setMailSended(true);
            setMessage(response.message);
          })
          .catch((error) => {
            catchError(error);
          })
          .finally(() => {
            setLoading(false);
          });
      };

  return (
    <div>
      <Layout className="layout-default layout-signin">
        <Content className="signin">
          <Row gutter={[24, 0]} justify="space-around">
            <Col
              xs={{ span: 24, offset: 0 }}
              lg={{ span: 6, offset: 2 }}
              md={{ span: 12 }}
            >
              <Title className="mb-15">Réinitialisation de Mot de Passe</Title>
              {mailSended===false ? (
                <div>
                    <Title className="font-regular text-muted" level={5}>
                        Veuillez entrer votre adresse e-mail pour recevoir un lien de réinitialisation de mot de passe.
                    </Title>
                    <Form
                        onFinish={onFinish}
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
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={loading} style={{ width: '100%' }}>
                                Recevoir le lien de réinitialisation
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
               ) : (
                    <div>
                         <Result
                            status="success"
                            title={
                                <Text style={{ fontSize: '18px', lineHeight: '1.2', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                                     {message}
                                </Text>
                            }
                            extra={[
                            <Button type="primary" key="login" onClick={()=>navigate('/login')}>
                                Retour à la connexion
                            </Button>,
                            ]}
                        />
                    </div>     
                 )}
            </Col>
            <Col
              className="sign-img"
              style={{ padding: 12 }}
              xs={{ span: 24 }}
              lg={{ span: 12 }}
              md={{ span: 12 }}
            >
              <img src={logosenegal} alt="" />
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
    </div>
  );


}