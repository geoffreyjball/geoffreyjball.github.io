const component = document.querySelector('#component')
const state = { users: [], selectedUser: null }

function setState(o) {
  for (let k in o) {
    state[k] = o[k]
  }

  render()
}

async function handleConversationsChange(conversationIds) {
  let conversations = await Missive.fetchConversations(conversationIds, [
    'email_addresses',
  ])

  let contacts = {}
  let emails = []
  let emailAddresses = Missive.getEmailAddresses(conversations)

  for (let addressField of emailAddresses) {
    let { address, name } = addressField

    // if (address.endsWith('conferencebadge.com')) {
    if (address.endsWith('ghsd75.ca')) {
      continue
    }

    emails.push(address)
    contacts[address] = name
  }

  if (!emails.length) {
    setState({ users: [], selectedUser: null })
    return
  }

  let response = await fetch(`${VARS.users_path}?emails=${emails}`)
  let users = await response.json()
  users = users.map((u) => {
    u.name = contacts[u.email]
    return u
  })

  setState({ users, selectedUser: users[0] })
}

function selectUser(index) {
  let { users } = state
  let selectedUser = users[index]

  setState({ selectedUser })
}

function renderTab(user, i) {
  let selected = state.selectedUser == user
  let { letters, formatted } = Missive.formatContact({
    address: user.email,
    name: user.name,
  })

  return `
    <div
      class="${Missive.classNames({
        tab: true,
        'tab--selected': selected,
      })}"
      title="${formatted}"
      onClick="selectUser(${i})"
    >
      <span>${letters}</span>
      <i class="tab-rounded-corner-l"></i>
      <i class="tab-rounded-corner-r"></i>
    </div>
  `
}

function renderField(label, value, { notNull, grow, href } = {}) {
  if (value == undefined && notNull) return ''

  let classes = Missive.classNames({
    'text-c': true,
    'column-grow': grow,
  })

  if (!grow) label += ':'
  if (href) value = `<a href=${href} target="_blank">${value}</a>`

  return `
    <div class="row row-small columns-middle">
      <span class="${classes}">${label} </span>
      <code class="code ellipsis">${value}</code>
    </div>
  `
}

function renderLinks(links) {
  links = links.filter((l) => l[1])

  return links
    .map(([label, href]) => {
      return `<a href="${href}" target="_blank">${label}</a>`
    })
    .join('<span class="text-c"> · </span>')
}

function renderEvent(event) {
  if (!event) return ''
  Missive.injectSVGIcon('menu-right')

  return `
    <div class="box box-collapsable">
      <div class="box-header columns-middle">
        <span class="margin-right-small">
          <i class="icon icon-menu-right" style="width: 6px; height: 10px">
            <svg style="width: 24px; height: 24px">
              <use xlink:href="#menu-right" />
            </svg>
          </i>
        </span>

        <div class="column-grow columns columns-middle ellipsis">
          <span class="column-grow ellipsis margin-right">${event.name}</span>
          <time class="text-c text-small">${
            Missive.formatTimestamp(event.start_at, { until: event.end_at })
              .formatted
          }</time>
        </div>
      </div>

      <div class="box-content">
        <div class="section">
          ${renderField('Attendees', event.attendees_count || 0)}
          ${renderField('Product', event.product || ' - ')}
          ${renderField('Provider', event.provider)}
          ${renderField('Printable', event.printable)}
          ${renderField('Onsite', event.onsite)}
          ${renderField('Purchased badges', event.purchased_badge_count)}
          ${renderField('Unpurchased badges', event.unpurchased_badge_count)}
          ${renderField('Resolve duplicates', event.resolve_duplicates)}
        </div>

        <div class="section">
          ${
            event.orders && event.orders.length
              ? event.orders.map(renderOrder).join('')
              : '<div class="text-c">No orders</div>'
          }
        </div>

        <div class="section text-small align-center">
          ${renderLinks([
            ['Edit event', event.urls.admin_event],
            ['Editor', event.urls.editor],
          ])}
        </div>
      </div>
    </div>
  `
}

function renderOrder(order) {
  if (!order) return ''

  return `
    <div class="box box-collapsable">
      <div class="box-header columns-middle">
        <span class="margin-right-small">
          <i class="icon icon-menu-right" style="width: 6px; height: 10px">
            <svg style="width: 24px; height: 24px">
              <use xlink:href="#menu-right" />
            </svg>
          </i>
        </span>

        <div class="column-grow columns columns-middle">
          <span class="column-grow">CB-Order-${order.id}</span>
          <span class="text-small">${
            order.purchased_at
              ? `<span class="text-b">$${order.grand_total_in_cents /
                  100}</span>`
              : '<span class="text-c">pending</span>'
          }</span>
        </div>
      </div>

      <div class="box-content">
        <div class="section">
          ${renderField('Coupon', order.coupon || ' - ')}
          ${renderField(
            'Expected delivery',
            order.expected_delivery_date
              ? Missive.formatTimestamp(order.expected_delivery_date, {
                  time: true,
                }).formatted
              : ' - ',
          )}
          ${renderField('Tracking number sent', order.tracking_number_sent)}
        </div>

        <div class="section">
          ${
            order.items && order.items.length
              ? order.items.map(renderItem).join('')
              : '<div class="text-c">No items</div>'
          }
        </div>

        <div class="section text-small align-center">
          ${renderLinks([
            ['Edit order', order.urls.admin_order],
            ['Coupon', order.urls.coupon],
            ['Tracking', order.urls.tracking],
            ['Xero', order.urls.xero],
          ])}
        </div>
      </div>
    </div>
  `
}

function renderItem(item) {
  if (!item) return ''

  return renderField(item.description || item.product, item.quantity, {
    grow: true,
  })
}

function renderUser(user) {
  if (!user) return ''
  Missive.injectSVGIcon('external')

  return `
    <div class="columns-middle section">
      <img
        class="margin-right-medium"
        src="https://avatars.missiveapp.com/${user.email}?size=32"
        style="width: 34px; height: 34px; border-radius: 100%"
      />
      <div class="column-grow ellipsis margin-right-small">
        <strong>${user.email || ''}</strong>
      </div>
      <a
        target="_blank"
        href="${user.urls.log_in}"
      >
        <svg style="width: 17px; height: 17px">
          <use xlink:href="#external" />
        </svg>
      </a>
    </div>

    <div class="section">
      ${renderField(
        'Joined',
        Missive.formatTimestamp(user.created_at, { year: true }).formatted,
      )}
      ${renderField('Provider', user.provider, { notNull: true })}
      ${renderField('Font size tool', user.options.font_size_tool_available)}
    </div>

    <div class="section">
      ${
        user.events && user.events.length
          ? user.events.map(renderEvent).join('')
          : '<div class="text-c">No events</div>'
      }
    </div>

    <div class="column-grow"></div>
    <div class="margin-top text-small align-center">
      ${renderLinks([
        ['User', user.urls.admin_user],
        ['Events', user.urls.admin_events],
        ['Orders', user.urls.admin_orders],
        ['Stripe', user.urls.stripe],
      ])}
    </div>
  `
}

function renderUsers() {
  let { users, selectedUser } = state
  if (!users.length) return ''

  return `
  <div class="tabs-container columns-vertical">
    <div class="tabs columns">
      ${users.map(renderTab).join('')}
    </div>
    <div class="tabs-content column-grow columns-vertical padding">
      ${renderUser(selectedUser)}
    </div>
  </div>
  `
}

function render() {
  component.innerHTML = renderUsers()
}

document.addEventListener(
  'click',
  (e) => {
    let { target } = e

    if (target && target.matches('.box-collapsable .box-header')) {
      target.parentNode.classList.toggle('box-collapsable--opened')
    }
  },
  true,
)

Missive.on('change:conversations', handleConversationsChange)
render()
