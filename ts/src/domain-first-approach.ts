type UseFunction<N, Output, Input> = { name: N; fn: (input: Input) => Output }
type UseFunctionAsync<N, Output, Input> = {
  name: N
  fn: (input: Input) => Promise<Output>
}

// @todo return a ResultType
const makeCreateOrder = () => {
  type CreateOrder = UseFunctionAsync<
    'createOrder',
    { orderId: string; status: 'ready' | 'pending' },
    { item: string; qty: number }
  >
  type CreateShipment = UseFunctionAsync<
    'createShipment',
    { shipmentId: string },
    { orderId: string }
  >

  const main = async ({ deps }: { deps: [CreateOrder, CreateShipment] }) => {
    const [createOrder, createShipment] = deps
    const order = await createOrder.fn({ item: 'a', qty: 1 })
    if (order.status === 'ready') {
      const shipment = await createShipment.fn({ orderId: order.orderId })
      return [order, shipment] as const
    }
    return [order] as const
  }
  return [main] as const
}

;(async () => {
  const [fn] = makeCreateOrder()

  const [order, shipment] = await fn({
    deps: [
      {
        name: 'createOrder',
        fn: async () => {
          return { orderId: '1', status: 'ready' }
        },
      },
      {
        name: 'createShipment',
        fn: async ({ orderId }) => {
          return { shipmentId: '1' }
        },
      },
    ],
  })

  console.log(order.orderId)
  if (shipment) {
    console.log(shipment.shipmentId)
  }
})()

export {}
