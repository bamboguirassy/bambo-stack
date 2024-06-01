import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Checkbox, Row, Col, Card } from 'antd';
import { GroupeService } from '../../services/GroupeService';
import { catchError } from '../../services/DaoService';
import Toast from '../../helpers/Toast';

const { TextArea } = Input;

const GroupeEdit = ({ visible, uid, onUpdate, onCancel }) => {
    const [form] = Form.useForm();
    const [permissionsData, setPermissionsData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [initialValues, setInitialValues] = useState(null);
    const [checkedList, setCheckedList] = React.useState([]);

    useEffect(() => {
        setLoading(true);
        Promise.all([
            GroupeService.getInstance().getPermissions(),
            GroupeService.getInstance().find(uid)
        ]).then(([permissionsResponse, groupeResponse]) => {
            setPermissionsData(permissionsResponse.data);
            setCheckedList(groupeResponse.data.permissions);
            setInitialValues({
                nom: groupeResponse.data.nom,
                code: groupeResponse.data.code,
                description: groupeResponse.data.description,
            });
            form.setFieldsValue({
                nom: groupeResponse.data.nom,
                code: groupeResponse.data.code,
                description: groupeResponse.data.description,
            });
        }).catch(error => {
            catchError(error);
        }).finally(() => {
            setLoading(false);
        });
    }, [uid, form]); // Trigger the effect when the modal visibility changes

    const onFinish = (values) => {
        values.permissions = checkedList;
        setLoading(true);
        GroupeService.getInstance()
            .update(uid, values)
            .then((response) => {
                Toast.success(response.message);
                onUpdate(response.data);
                form.resetFields();
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
            title="Modifier un groupe"
            okText="Enregistrer"
            cancelText="Annuler"
            onCancel={onCancel}
            onOk={() => {
                form.validateFields().then((values) => {
                    form.resetFields();
                    onFinish(values);
                }).catch((info) => {
                    console.log('Validate Failed:', info);
                });
            }}
        >
            <Card loading={loading}>
                <Form layout='vertical'
                    form={form}
                    name="editDataForm"
                    labelCol={{ span: 12 }}
                    wrapperCol={{ span: 24 }}
                    initialValues={initialValues}
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
                                <Row>
                                    <Col span={24}>
                                        <Checkbox
                                            onChange={e => onCheckAllChange(e, group)}
                                            checked={group.permissions.every(p => checkedList.includes(p.code))}
                                            indeterminate={
                                                group.permissions.some(p => checkedList.includes(p.code)) &&
                                                !group.permissions.every(p => checkedList.includes(p.code))
                                            }
                                        >
                                            <h4>{group.nom}</h4>
                                        </Checkbox>
                                    </Col>
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

export default GroupeEdit;
