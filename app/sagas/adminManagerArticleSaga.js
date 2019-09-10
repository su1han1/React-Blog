import {take,call,put,select} from 'redux-saga/effects'
import {get, post} from '../fetch/fetch'
import {actionsTypes as IndexActionTypes} from '../reducers'
import {actionTypes as ArticleTypes} from '../reducers/adminManagerArticle'
import {actionTypes as NewArticleTypes} from '../reducers/adminManagerNewArticle'

export function* getArticleList (pageNum) {
    yield put({type: IndexActionTypes.FETCH_START});
    try {
        return yield call(get, `/getArticles?pageNum=${pageNum}&isPublish=false`);
    } catch (err) {
        yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: 'Network Request Failed', msgType: 0});
    } finally {
        yield put({type: IndexActionTypes.FETCH_END})
    }
}

export function* getArticleListFlow () {
    while (true){
        let req = yield take(ArticleTypes.ADMIN_GET_ARTICLE_LIST);
        let res = yield call(getArticleList,req.pageNum);
        if(res){
            if (res.code === 0) {
                res.data.pageNum = req.pageNum;
                yield put({type:ArticleTypes.ADMIN_RESPONSE_GET_ARTICLE_LIST,data:res.data})
            } else if (res.message === 'Authentication Expired. Please Sign In Again') {
                yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: res.message, msgType: 0});
                setTimeout(function () {
                    location.replace('/');
                }, 1000);
            } else {
                yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: res.message, msgType: 0});
            }
        }
    }
}

export function* deleteArticle (id) {
    yield put({type: IndexActionTypes.FETCH_START});
    try {
        return yield call(get, `/admin/article/delArticle?id=${id}`);
    } catch (err) {
        yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: 'Network Request Failed', msgType: 0});
    } finally {
        yield put({type: IndexActionTypes.FETCH_END})
    }
}

export function* deleteArticleFlow () {
    while(true){
        let req = yield take(ArticleTypes.ADMIN_DELETE_ARTICLE);
        const pageNum = yield select(state=>state.admin.articles.pageNum);
        let res = yield call(deleteArticle,req.id);
        if(res){
            if (res.code === 0) {
                yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: 'Delete Successful!', msgType: 1});
                yield put({type:ArticleTypes.ADMIN_GET_ARTICLE_LIST,pageNum})
            } else if (res.message === 'Authentication Expired. Please Sign In Again') {
                yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: res.message, msgType: 0});
                setTimeout(function () {
                    location.replace('/');
                }, 1000);
            } else {
                yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: res.message, msgType: 0});
            }
        }
    }
}

export function* editArticle (id) {
    yield put({type: IndexActionTypes.FETCH_START});
    try {
        return yield call(get, `/getArticleDetail?id=${id}`);
    } catch (err) {
        yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: 'Network Request Failed', msgType: 0});
    } finally {
        yield put({type: IndexActionTypes.FETCH_END})
    }
}

export function* editArticleFlow () {
    while (true){
        let req = yield take(ArticleTypes.ADMIN_EDIT_ARTICLE);
        let res = yield call(editArticle,req.id);
        if(res){
            if (res.code === 0) {
                let title = res.data.title;
                let content = res.data.content;
                let tags = res.data.tags;
                let id = res.data._id;
                yield put({type:NewArticleTypes.SET_ARTICLE_ID,id});
                yield put({type:NewArticleTypes.UPDATING_TAGS,tags});
                yield put({type:NewArticleTypes.UPDATING_CONTENT,content});
                yield put({type:NewArticleTypes.UPDATING_TITLE,title});
            } else {
                yield put({type: IndexActionTypes.SET_MESSAGE, msgContent: res.message, msgType: 0});
            }
        }
    }
}