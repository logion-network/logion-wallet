// Auto-generated via `yarn polkadot-types-from-defs`, do not edit
/* eslint-disable */

import type { Bytes, Enum, Struct, Vec, bool, u128, u32, u64, u8 } from '@polkadot/types';
import type { AccountId, Balance, Hash, MultiAddress } from '@polkadot/types/interfaces/runtime';
import type { AccountInfoWithDualRefCount } from '@polkadot/types/interfaces/system';
import type { DepositBalance } from '@polkadot/types/interfaces/uniques';

/** @name AccountInfo */
export interface AccountInfo extends AccountInfoWithDualRefCount {}

/** @name Address */
export interface Address extends MultiAddress {}

/** @name AssetDetails */
export interface AssetDetails extends Struct {
  readonly owner: AccountId;
  readonly issuer: AccountId;
  readonly admin: AccountId;
  readonly freezer: AccountId;
  readonly supply: Balance;
  readonly deposit: DepositBalance;
  readonly max_zombies: u32;
  readonly min_balance: Balance;
  readonly zombies: u32;
  readonly accounts: u32;
  readonly is_frozen: bool;
}

/** @name AssetId */
export interface AssetId extends u64 {}

/** @name AssetMetadata */
export interface AssetMetadata extends Struct {
  readonly deposit: DepositBalance;
  readonly name: Bytes;
  readonly symbol: Bytes;
  readonly decimals: u8;
}

/** @name File */
export interface File extends Struct {
  readonly hash: Hash;
  readonly nature: Bytes;
}

/** @name LegalOfficerCaseOf */
export interface LegalOfficerCaseOf extends Struct {
  readonly owner: AccountId;
  readonly requester: AccountId;
  readonly metadata: Vec<MetadataItem>;
  readonly files: Vec<File>;
  readonly closed: bool;
  readonly loc_type: LocType;
  readonly links: Vec<LocLink>;
}

/** @name LocId */
export interface LocId extends u128 {}

/** @name LocLink */
export interface LocLink extends Struct {
  readonly id: LocId;
  readonly nature: Bytes;
}

/** @name LocType */
export interface LocType extends Enum {
  readonly isTransaction: boolean;
  readonly isIdentity: boolean;
}

/** @name LookupSource */
export interface LookupSource extends MultiAddress {}

/** @name MetadataItem */
export interface MetadataItem extends Struct {
  readonly name: Bytes;
  readonly value: Bytes;
}

/** @name PeerId */
export interface PeerId extends Bytes {}

/** @name TAssetBalance */
export interface TAssetBalance extends u128 {}

export type PHANTOM_DEFAULT = 'default';
