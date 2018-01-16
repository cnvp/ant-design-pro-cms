import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { Row, Col, Card, Form, Input, Icon, Button, Select, Dropdown, Menu, Modal, message } from 'antd';
import StandardTableUser from '../../components/StandardTableUser';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './TableListUser.less';

const FormItem = Form.Item;
const { Option } = Select;
const getValue = obj => Object.keys(obj).map(key => obj[key]).join(',');

@connect(state => ({
  user: state.user,
}))
@Form.create()
export default class TableListUser extends PureComponent {
  state = {
    addInputValueForName: '',
    modalVisible: false,
    selectedRows: [],
    formValues: {},
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/fetch',
    });
  }

  handleStandardTableChange = (pagination, filtersArg, sorter) => {
    const { dispatch } = this.props;
    const { formValues } = this.state;

    const filters = Object.keys(filtersArg).reduce((obj, key) => {
      const newObj = { ...obj };
      newObj[key] = getValue(filtersArg[key]);
      return newObj;
    }, {});

    const params = {
      currentPage: pagination.current,
      pageSize: pagination.pageSize,
      ...formValues,
      ...filters,
    };
    if (sorter.field) {
      params.sorter = `${sorter.field}_${sorter.order}`;
    }

    dispatch({
      type: 'user/fetch',
      payload: params,
    });
  }

  handleFormReset = () => {
    const { form, dispatch } = this.props;
    form.resetFields();
    this.setState({
      formValues: {},
    });
    dispatch({
      type: 'user/fetch',
      payload: {},
    });
  }

  handleMenuClick = (e) => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'user/removes',
          payload: {
            id: selectedRows.map(row => row._id).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      default:
        break;
    }
  }

  handleSelectRows = (rows) => {
    this.setState({
      selectedRows: rows,
    });
  }

  handleSearch = (e) => {
    e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;

      const values = {
        ...fieldsValue,
        updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      };

      this.setState({
        formValues: values,
      });

      dispatch({
        type: 'user/fetch',
        payload: values,
      });
    });
  }

  handleModalVisible = (flag) => {
    this.setState({
      modalVisible: !!flag,
    });
  }

  // 处理添加单个数据表单的Name值--做准备-->添加单个数据
  handleAddInputForName = (e) => {
    this.setState({
      addInputValueForName: e.target.value,
    });
  }

  // 添加单个数据
  handleAdd = (values) => {
    const payload = values;
    this.props.dispatch({
      type: 'user/add',
      payload,
    });
    // message.success('添加成功');
    this.setState({
      modalVisible: false,
    });
  }

  okFormHandler = () => {
    // const { onOk } = this.props;
    // const { handleAdd } = this.props;
    // 调用添加方法onOk，把遍历的values穿进去
    this.props.form.validateFields((err, values) => {
      if (!err) {
        // onOk(values);
        this.handleAdd(values);
        // console.log(`valuse1: ${JSON.stringify(values)}`);
        // this.hideModelHandler();
        // 调用添加方法onOk，把遍历的values穿进去
      }
    });
  };

  // 删除单个数据
  handleRemove = (id) => {
    const { dispatch } = this.props;
    // console.log(`props: ${JSON.stringify(this.props)} id: ${id}`);
    dispatch({
      type: 'user/remove',
      payload: id,
    });
  }

  // 修改单个数据
  handleUpdate = (id, values) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'user/update',
      payload: { id, values },
    });
  }

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="角色名称">
              {getFieldDecorator('search')(
                <Input placeholder="请输入" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">查询</Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>重置</Button>
            </span>
          </Col>
        </Row>
      </Form>
    );
  }

  renderForm() {
    return this.renderSimpleForm();
  }

  render() {
    const { user: { loading: userLoading, data } } = this.props;
    const roleOptions = [];
    const { selectedRows, modalVisible } = this.state;

    for (const option of data.roleOptions) {
      roleOptions.push(<Option key={option._id}>{option.name}</Option>);
    }

    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        <Menu.Item key="remove">删除</Menu.Item>
      </Menu>
    );

    return (
      <PageHeaderLayout title="角色列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>
              {this.renderForm()}
            </div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={() => this.handleModalVisible(true)}>
                新建
              </Button>
              {
                selectedRows.length > 0 && (
                  <span>
                    <Dropdown overlay={menu}>
                      <Button>
                        批量操作 <Icon type="down" />
                      </Button>
                    </Dropdown>
                  </span>
                )
              }
            </div>
            <StandardTableUser
              selectedRows={selectedRows}
              loading={userLoading}
              data={data}
              handleRemove={this.handleRemove} // 传入handleRemove()
              handleUpdate={this.handleUpdate} // 传入handleUpdate()
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
            />
          </div>
        </Card>
        <Modal
          title="新增用户"
          visible={modalVisible}
          // onOk={this.handleAdd}
          onOk={this.okFormHandler}
          onCancel={() => this.handleModalVisible()}
        >
          <Form>
            <FormItem
              {...formItemLayout}
              label="账号"
            >
              {
                getFieldDecorator('mobile', {
                  rules: [{
                  required: true, message: '请输入手机号码',
                }],
                })(<Input placeholder="请输入手机号码" />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="密码"
            >
              {
                getFieldDecorator('password', {
                  rules: [{
                  required: true, message: '请输入密码(6-12位)',
                }],
                })(<Input placeholder="请输入密码(6-12位)" type="password" />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="真实姓名"
            >
              {
                getFieldDecorator('realName', {
                  rules: [{
                  required: true, message: '请输入真实姓名',
                }],
                })(<Input placeholder="请输入真实姓名" />)
              }
            </FormItem>
            <FormItem
              {...formItemLayout}
              label="角色"
            >
              {
                getFieldDecorator('role', {
                  rules: [{
                  required: true, message: '请选择角色',
                }],
                })(<Select style={{ width: '100%' }} placeholder="请选择角色">{roleOptions}</Select>)
              }
            </FormItem>
          </Form>
        </Modal>
      </PageHeaderLayout>
    );
  }
}