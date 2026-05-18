export const didRegistryAbi = [
  {
    type: 'function',
    name: 'resolve',
    stateMutability: 'view',
    inputs: [{ name: 'did', type: 'string' }],
    outputs: [
      { name: 'owner', type: 'address' },
      { name: 'document', type: 'string' },
    ],
  },
  {
    type: 'function',
    name: 'isRegistered',
    stateMutability: 'view',
    inputs: [{ name: 'did', type: 'string' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const
