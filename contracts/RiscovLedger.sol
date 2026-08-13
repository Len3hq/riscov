// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/// @notice Stores the current risk rating for each asset the Watcher tracks.
/// The full reasoning text lives off-chain (Watcher's local logs for now);
/// only its hash is stored here so any consumer can verify it wasn't altered.
contract RiscovLedger {
    enum Rating {
        Green,
        Yellow,
        Red
    }

    struct RatingRecord {
        Rating rating;
        uint256 timestamp;
        bytes32 reasonHash;
    }

    address public immutable watcher;

    mapping(bytes32 => RatingRecord) private ratings;

    event RatingUpdated(bytes32 indexed assetId, Rating rating, bytes32 reasonHash, uint256 timestamp);

    error NotWatcher();
    error UnknownAsset();

    modifier onlyWatcher() {
        if (msg.sender != watcher) revert NotWatcher();
        _;
    }

    constructor(address _watcher) {
        watcher = _watcher;
    }

    function submitRating(bytes32 assetId, Rating rating, bytes32 reasonHash) external onlyWatcher {
        ratings[assetId] = RatingRecord({rating: rating, timestamp: block.timestamp, reasonHash: reasonHash});
        emit RatingUpdated(assetId, rating, reasonHash, block.timestamp);
    }

    function getRating(bytes32 assetId) external view returns (Rating rating, uint256 timestamp, bytes32 reasonHash) {
        RatingRecord memory r = ratings[assetId];
        if (r.timestamp == 0) revert UnknownAsset();
        return (r.rating, r.timestamp, r.reasonHash);
    }

    function hasRating(bytes32 assetId) external view returns (bool) {
        return ratings[assetId].timestamp != 0;
    }
}
