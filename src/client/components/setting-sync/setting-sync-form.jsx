/**
 * setting sync panel，
 */

/**
 * bookmark form
 */
import { useDelta, useConditionalEffect } from 'react-delta'
import { ArrowDownOutlined, ArrowUpOutlined, QuestionCircleOutlined, SaveOutlined, ClearOutlined } from '@ant-design/icons'
import { Button, Input, notification, Tooltip, Form, Switch } from 'antd'
import Link from '../common/external-link'
import moment from 'moment'
import eq from 'fast-deep-equal'
import { syncTokenCreateUrls } from '../../common/constants'
import './sync.styl'

const FormItem = Form.Item
const { prefix } = window
const e = prefix('form')
const ss = prefix('settingSync')
const s = prefix('setting')
const sh = prefix('ssh')

export default function SyncForm (props) {
  const [form] = Form.useForm()
  const delta = useDelta(props.formData)
  useConditionalEffect(() => {
    form.resetFields()
  }, delta && delta.prev && !eq(delta.prev, delta.curr))

  function disabled () {
    const {
      token,
      gistId
    } = props.formData
    return !token || !gistId
  }

  async function save (res) {
    const { syncType } = props
    const up = {
      [syncType + 'AccessToken']: res.token
    }
    if (res.gistId) {
      up[syncType + 'GistId'] = res.gistId
    }
    props.store.updateSyncSetting(up)
    const test = await props.store.testSyncToken(syncType, res.gistId)
    if (!test) {
      return notification.error({
        message: 'token invalid'
      })
    }
    if (!res.gistId) {
      props.store.createGist(syncType)
    }
  }

  function upload () {
    props
      .store
      .uploadSetting(props.syncType)
      .catch(props.store.onError)
  }

  function download () {
    props
      .store
      .downloadSetting(props.syncType)
      .catch(props.store.onError)
  }

  // onChangeAutoSync = checked => {
  //   this.props.store.updateSyncSetting({
  //     autoSync: checked
  //   })
  // }

  function getTokenCreateGuideUrl () {
    return syncTokenCreateUrls[props.syncType]
  }

  function renderGistUrl () {
    if (!props.formData.url) {
      return null
    }
    return (
      <Link to={props.formData.url}>Check gist</Link>
    )
  }

  const {
    lastSyncTime = ''
  } = props.formData
  const { syncType } = props
  const timeFormatted = lastSyncTime
    ? moment(lastSyncTime).format('YYYY-MM-DD HH:mm:ss')
    : '-'

  function createLabel (name, text) {
    return (
      <Tooltip
        title={
          <span>
            {syncType} {text}
            <Link className='mg1l' to={getTokenCreateGuideUrl()} />
          </span>
        }
      >
        <span>
          {name} <QuestionCircleOutlined />
        </span>
      </Tooltip>
    )
  }
  const tokenLabel = createLabel('token', 'personal access token')
  const gistLabel = createLabel('gist', 'gist ID')
  return (
    <Form
      onFinish={save}
      form={form}
      className='form-wrap pd1x'
      name='setting-sync-form'
      layout='vertical'
      initialValues={props.formData}
    >
      <FormItem
        label={tokenLabel}
        hasFeedback
        name='token'
        rules={[{
          max: 100, message: '100 chars max'
        }, {
          required: true, message: syncType + ' access token required'
        }]}
      >
        <Input.Password
          placeholder={syncType + ' personal access token'}
        />
      </FormItem>
      <FormItem
        label={s('encrypt')}
      >
        <Switch
          onChange={props.store.onChangeEncrypt}
          checked={!!props.syncEncrypt}
        />
      </FormItem>
      <FormItem
        label={gistLabel}
        name='gistId'
        rules={[{
          max: 100, message: '100 chars max'
        }]}
      >
        <Input
          placeholder={syncType + ' gist id'}
        />
      </FormItem>
      {/* <FormItem
        {...formItemLayout}
        label={ss('autoSync')}
      >
        <Switch
          checked={autoSync}
          disabled={this.disabled()}
          onChange={this.onChangeAutoSync}
        />
      </FormItem> */}
      <FormItem>
        <p>
          <Button
            type='ghost'
            className='mg1r mg1b sync-btn-save'
            htmlType='submit'
            icon={<SaveOutlined />}
          >{e('save')}</Button>
          {/* <Button
            type='ghost'
            onClick={this.sync}
            disabled={this.disabled()}
            className='mg1r'
            loading={isSyncingSetting}
            icon='swap'
          >{ss('sync')}</Button> */}
          <Button
            type='ghost'
            onClick={upload}
            disabled={disabled()}
            className='mg1r mg1b'
            icon={<ArrowUpOutlined />}
          >{ss('uploadSettings')}</Button>
          <Button
            type='ghost'
            onClick={download}
            disabled={disabled()}
            className='mg1r mg1b sync-btn-down'
            icon={<ArrowDownOutlined />}
          >{ss('downloadSettings')}</Button>
          <Button
            type='ghost'
            onClick={props.store.clearSyncSetting}
            disabled={disabled()}
            className='mg1r mg1b sync-btn-clear'
            icon={<ClearOutlined />}
          >{sh('clear')}</Button>
        </p>
        <p>
          {ss('lastSyncTime')}: {timeFormatted}
        </p>
        <p>
          {renderGistUrl()}
        </p>
      </FormItem>
    </Form>
  )
}
