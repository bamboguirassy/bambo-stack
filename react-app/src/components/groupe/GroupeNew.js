import React from 'react';
import { Modal, Form, Input, Checkbox, Row, Col, Card } from 'antd';
import { GroupeService } from '../../services/GroupeService';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';

const { TextArea } = Input;

const GroupeNew = ({ visible, onCreate, onCancel }) => {
  const [form] = Form.useForm();
  const [permissionsData, setPermissionsData] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [checkedList, setCheckedList] = React.useState([]);

  React.useEffect(() => {
    setLoading(true);
    GroupeService.getInstance()
      .getPermissions()
      .then((response) => {
        setPermissionsData(response.data);
      }).catch((error) => {
        catchError(error);
      }).finally(() => {
        setLoading(false);
      });
  }, []);

  const onFinish = (values) => {
    values.permissions = Object.values(checkedList);
    setLoading(true);
    GroupeService.getInstance()
      .create(values)
      .then((response) => {
        Toast.success(response.message);
        form.resetFields();
        setCheckedList([]);
        onCreate(response.data);
      }).catch((error) => {
        catchError(error);
      }).finally(() => {
        setLoading(false);
      });
  };

  const onCheckAllChange = (e, group) => {
    const groupPermissions = group.permissions.map(p => p.code);
    const newCheckedList = e.target.checked
      ? [...new Set([...checkedList, ...groupPermissions])]
      : checkedList.filter(code => !groupPermissions.includes(code));
    setCheckedList(newCheckedList);
  };

  const onCheckboxChange = (e, code) => {
    const newCheckedList = e.target.checked
      ? [...checkedList, code]
      : checkedList.filter(item => item !== code);
    setCheckedList(newCheckedList);
  };


  return (
    <Modal width={"70%"}
      open={visible}
      title="Créer un nouveau groupe"
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
      <Card loading={loading} style={{ marginBottom: 20 }}>
        <Form layout='vertical'
          form={form}
          name="createDataForm"
          labelCol={{ span: 12 }}
          wrapperCol={{ span: 24 }}
          initialValues={{ enabled: false, permissions: [] }}
        >
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Nom"
                name="nom"
                rules={[{ required: true, message: 'Veuillez saisir le nom!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Code"
                name="code"
                rules={[{ required: true, message: 'Veuillez saisir le code!' }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: 'Veuillez saisir la description!' }]}
          >
            <TextArea />
          </Form.Item>

          <Form.Item label="Permissions">
            {permissionsData.map((group) => (
              <div key={group.code}>
                <br />
                <Checkbox
                  onChange={e => onCheckAllChange(e, group)}
                  checked={group.permissions.every(p => checkedList.includes(p.code))}
                  indeterminate={
                    group.permissions.some(p => checkedList.includes(p.code)) &&
                    !group.permissions.every(p => checkedList.includes(p.code))
                  }
                >
                  <h5>{group.nom}</h5>
                </Checkbox>
                <Row>
                  {group.permissions.map(permission => (
                    <Col span={12} key={permission.code}>
                      <Checkbox
                        checked={checkedList.includes(permission.code)}
                        onChange={e => onCheckboxChange(e, permission.code)}
                      >
                        {permission.nom}
                      </Checkbox>
                    </Col>
                  ))}
                </Row>
              </div>
            ))}
          </Form.Item>
        </Form>
      </Card>
    </Modal>
  );
};

export default GroupeNew;
