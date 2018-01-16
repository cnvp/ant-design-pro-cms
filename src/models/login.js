import { routerRedux } from 'dva/router';
import { AccountLogin } from '../services/api';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      yield put({
        type: 'changeSubmitting',
        payload: true,
      });
      const response = yield call(AccountLogin, payload);
      // Login successfully
      if (response.code === 0) {
        // 登录成功
        response.status = 'ok';
        response.type = 'account';
        window.localStorage.setItem('X-TOKEN', response.data.token);
        yield put(routerRedux.push('/'));
      } else {
        // 登录失败
        response.status = 'error';
        response.type = 'account';
      }
      yield put({
        type: 'changeLoginStatus',
        payload: response,
      });
    },
    *logout(_, { put }) {
      yield put({
        type: 'changeLoginStatus',
        payload: {
          status: false,
        },
      });
      // 清除LocalSotrage
      window.localStorage.removeItem('L-TOKEN');
      yield put(routerRedux.push('/user/login'));
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      return {
        ...state,
        status: payload.status,
        type: payload.type,
        submitting: false,
      };
    },
    changeSubmitting(state, { payload }) {
      return {
        ...state,
        submitting: payload,
      };
    },
  },
};
