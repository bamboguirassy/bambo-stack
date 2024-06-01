import { Card, Form, Modal, Select, Spin } from "antd";
import React, { useState } from "react";
import { catchError } from "../../services/DaoService";
import UserService from "../../services/UserService";
import UserGroupeService from "../../services/UserGroupeService";
import Toast from "../../helpers/Toast";


export default function AddUserGroupe({ visible, onSave, onCancel, uid }) {
  const [form] = Form.useForm();
  const [creating, setCreating] = React.useState(false);
  const [userOptions, setUserOptions] = React.useState([]);
  const [unattachedUsers, setUnattachedUsers] = useState([]);

  React.useEffect(() => {
    if (!visible) return;
    Promise.all([
      UserService.getInstance().all(),
      UserService.getInstance().getUserIdsAttachedToGroup(uid)
    ]).then(([allUsersResponse, attachedUserIdsResponse]) => {
      const allUsers = allUsersResponse.data;
      const attachedUserIds = attachedUserIdsResponse.data;
      const unattached = allUsers.filter(user => {
        return !attachedUserIds.some(attachedUserId => attachedUserId === user.id);
      });
      setUnattachedUsers(unattached);
    }).catch((error) => {
      catchError(error);
    }).finally(() => {
    });
  }, [uid, visible]);

  React.useEffect(() => {
    const options = unattachedUsers.map(item => ({
      label: `${item.name} <${item.email}>`, value: item.id
    }));
    setUserOptions(options);
  }, [unattachedUsers]);


  const handleAddUsers = (values) => {
    setCreating(true);
    UserGroupeService.getInstance()
      .linkUsersToGroupe(uid, values)
      .then(response => {
        Toast.success(response.message);
        form.resetFields();
        onSave(response.data);
      }).catch(error => {
        catchError(error);
      }).finally(() => {
        setCreating(false);
      });
  };

  const onFailed = (errorInfo) => {
    catchError(errorInfo);
  }


  return (
    <Modal open={visible} okText="Enregistrer" cancelText="Annuler" onOk={form.submit} onCancel={onCancel}>
      <Card>
        <Spin spinning={creating}>
          <Form form={form} layout="vertical" onFinish={handleAddUsers} onFinishFailed={onFailed}>
            <Form.Item label="Ajouter des utilisateurs" name="userIds">
              <Select
                mode="multiple" optionFilterProp="children"
                allowClear
                style={{
                  width: '100%',
                }}
                placeholder="Sélectionnez des utilisateurs"
                options={userOptions}
              />
            </Form.Item>
          </Form>
        </Spin>
      </Card>
    </Modal>
  );

}