import React from 'react';
import { Modal, Form, Input, Checkbox, Row, Col, Card, Spin } from 'antd';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';
import { GroupeService } from '../../services/GroupeService';
import UserService from '../../services/UserService';

const UserNew = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  const [groupes, setGroupes] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedGroups, setSelectedGroups] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    GroupeService.getInstance()
      .all()
      .then((response) => {
        setGroupes(response.data);
      }).catch((error) => {
        catchError(error);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  const onFinish = (values) => {
    values.groupeIds = selectedGroups;
    setLoading(true);
    UserService.getInstance()
      .create(values)
      .then((response) => {
        Toast.success(response.message);
        form.resetFields();
        setSelectedGroups([]);
        onCreate(response.data);
      }).catch((error) => {
        catchError(error);
      }).finally(() => {
        setLoading(false);
      });
  };

  const onCheckGroupChange = (checkedValues) => {
    setSelectedGroups(checkedValues);
  };

  return (
    <Modal
      open={visible}
      title="Créer un nouvel utilisateur"
      okText="Créer"
      cancelText="Annuler"
      onCancel={onCancel}
      onOk={() => {
        form.validateFields().then((values) => {
          onFinish(values);
        }).catch((info) => {
          console.log('Validate Failed:', info);
        });
      }}
    >
      <Card style={{ marginBottom: 20 }}>
        <Spin spinning={loading}>
          <Form layout='vertical'
            form={form}
            name="createUserForm"
            labelCol={{ span: 12 }}
            wrapperCol={{ span: 24 }}
            initialValues={{ enabled: false, groups: [] }}
          >
            <Row gutter={24}>
              <Col xs={24} md={24}>
                <Form.Item
                  label="Nom"
                  name="name"
                  rules={[
                    { required: true, message: 'Veuillez saisir le nom!' },
                    { min: 3, message: 'Le nom doit contenir au moins 3 caractères!' }
                  ]}
                >
                  <Input />
                </Form.Item>
              </Col>
              <Col xs={24} md={24}>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    { required: true, message: 'Veuillez saisir l\'adresse email!' },
                    { type: 'email', message: 'Veuillez saisir une adresse email valide!' }
                  ]}
                >
                  <Input type="email" />
                </Form.Item>
              </Col>
            </Row>

            <Form.Item label="Groupes">
              <Checkbox.Group value={selectedGroups} options={groupes.map(group => ({ label: group.nom, value: group.id }))} onChange={onCheckGroupChange} />
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </Modal>
  );
};

export default UserNew;