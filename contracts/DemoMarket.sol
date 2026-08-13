// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {RiscovLedger} from "./RiscovLedger.sol";

/// @notice A tiny demo market whose leverage limit is entirely DERIVED, live,
/// from RiscovLedger's current rating for `assetId`. Nothing here is cached
/// or pushed — the moment the Watcher submits a new rating, every read of
/// maxLeverage()/isPaused() on this contract reflects it immediately, with
/// no separate transaction against this contract required.
contract DemoMarket {
    RiscovLedger public immutable ledger;
    bytes32 public immutable assetId;

    uint256 public constant GREEN_MAX_LEVERAGE = 20;
    uint256 public constant YELLOW_MAX_LEVERAGE = 5;
    uint256 public constant RED_MAX_LEVERAGE = 0; // paused

    constructor(address ledgerAddress, bytes32 _assetId) {
        ledger = RiscovLedger(ledgerAddress);
        assetId = _assetId;
    }

    /// @notice The current rating this market is deriving its limits from.
    /// `exists` is false if the Watcher has never rated this asset — in that
    /// case the market fails safe (treated as paused) rather than defaulting
    /// to open.
    function currentRating() public view returns (RiscovLedger.Rating rating, uint256 timestamp, bool exists) {
        try ledger.getRating(assetId) returns (RiscovLedger.Rating r, uint256 ts, bytes32) {
            return (r, ts, true);
        } catch {
            return (RiscovLedger.Rating.Red, 0, false);
        }
    }

    function maxLeverage() public view returns (uint256) {
        (RiscovLedger.Rating rating, , bool exists) = currentRating();
        if (!exists) return RED_MAX_LEVERAGE;
        if (rating == RiscovLedger.Rating.Green) return GREEN_MAX_LEVERAGE;
        if (rating == RiscovLedger.Rating.Yellow) return YELLOW_MAX_LEVERAGE;
        return RED_MAX_LEVERAGE;
    }

    function isPaused() public view returns (bool) {
        return maxLeverage() == RED_MAX_LEVERAGE;
    }
}
