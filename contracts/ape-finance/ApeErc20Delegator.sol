pragma solidity ^0.5.16;

import "./ApeTokenInterfaces.sol";

/**
 * @title ApeFinance's ApeErc20Delegator Contract
 * @notice ApeTokens which wrap an EIP-20 underlying and delegate to an implementation
 */
contract ApeErc20Delegator is ApeTokenInterface, ApeErc20Interface, CDelegatorInterface {
    /**
     * @notice Construct a new money market
     * @param underlying_ The address of the underlying asset
     * @param comptroller_ The address of the Comptroller
     * @param interestRateModel_ The address of the interest rate model
     * @param initialExchangeRateMantissa_ The initial exchange rate, scaled by 1e18
     * @param name_ ERC-20 name of this token
     * @param symbol_ ERC-20 symbol of this token
     * @param decimals_ ERC-20 decimal precision of this token
     * @param admin_ Address of the administrator of this token
     * @param implementation_ The address of the implementation the contract delegates to
     * @param becomeImplementationData The encoded args for becomeImplementation
     */
    constructor(
        address underlying_,
        ComptrollerInterface comptroller_,
        InterestRateModel interestRateModel_,
        uint256 initialExchangeRateMantissa_,
        string memory name_,
        string memory symbol_,
        uint8 decimals_,
        address payable admin_,
        address implementation_,
        bytes memory becomeImplementationData
    ) public {
        // Creator of the contract is admin during initialization
        admin = msg.sender;

        // First delegate gets to initialize the delegator (i.e. storage contract)
        delegateTo(
            implementation_,
            abi.encodeWithSignature(
                "initialize(address,address,address,uint256,string,string,uint8)",
                underlying_,
                comptroller_,
                interestRateModel_,
                initialExchangeRateMantissa_,
                name_,
                symbol_,
                decimals_
            )
        );

        // New implementations always get set via the settor (post-initialize)
        _setImplementation(implementation_, false, becomeImplementationData);

        // Set the proper admin now that initialization is done
        admin = admin_;
    }

    /**
     * @notice Called by the admin to update the implementation of the delegator
     * @param implementation_ The address of the new implementation for delegation
     * @param allowResign Flag to indicate whether to call _resignImplementation on the old implementation
     * @param becomeImplementationData The encoded bytes data to be passed to _becomeImplementation
     */
    function _setImplementation(
        address implementation_,
        bool allowResign,
        bytes memory becomeImplementationData
    ) public {
        require(msg.sender == admin, "ApeErc20Delegator::_setImplementation: Caller must be admin");

        if (allowResign) {
            delegateToImplementation(abi.encodeWithSignature("_resignImplementation()"));
        }

        address oldImplementation = implementation;
        implementation = implementation_;

        delegateToImplementation(abi.encodeWithSignature("_becomeImplementation(bytes)", becomeImplementationData));

        emit NewImplementation(oldImplementation, implementation);
    }

    /**
     * @notice Sender supplies assets into the market and receives apeTokens in exchange
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param minter the minter
     * @param mintAmount The amount of the underlying asset to supply
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function mint(address minter, uint256 mintAmount) external returns (uint256) {
        minter;
        mintAmount; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Sender redeems apeTokens in exchange for the underlying asset
     * @dev Accrues interest whether or not the operation succeeds, unless reverted
     * @param redeemer The redeemer
     * @param redeemTokens The number of apeTokens to redeem into underlying
     * @param redeemAmount The amount of underlying to receive from redeeming apeTokens
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function redeem(
        address payable redeemer,
        uint256 redeemTokens,
        uint256 redeemAmount
    ) external returns (uint256) {
        redeemer;
        redeemTokens;
        redeemAmount; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Sender borrows assets from the protocol to their own address
     * @param borrower The borrower
     * @param borrowAmount The amount of the underlying asset to borrow
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function borrow(address payable borrower, uint256 borrowAmount) external returns (uint256) {
        borrower;
        borrowAmount; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Sender repays a borrow belonging to borrower
     * @param borrower the account with the debt being payed off
     * @param repayAmount The amount to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function repayBorrow(address borrower, uint256 repayAmount) external returns (uint256) {
        borrower;
        repayAmount; // Shh
        delegateAndReturn();
    }

    /**
     * @notice The sender liquidates the borrowers collateral.
     *  The collateral seized is transferred to the liquidator.
     * @param borrower The borrower of this apeToken to be liquidated
     * @param apeTokenCollateral The market in which to seize collateral from the borrower
     * @param repayAmount The amount of the underlying borrowed asset to repay
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function liquidateBorrow(
        address borrower,
        uint256 repayAmount,
        ApeTokenInterface apeTokenCollateral
    ) external returns (uint256) {
        borrower;
        repayAmount;
        apeTokenCollateral; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Get the token balance of the `owner`
     * @param owner The address of the account to query
     * @return The number of tokens owned by `owner`
     */
    function balanceOf(address owner) external view returns (uint256) {
        owner; // Shh
        delegateToViewAndReturn();
    }

    /**
     * @notice Get the underlying balance of the `owner`
     * @dev This also accrues interest in a transaction
     * @param owner The address of the account to query
     * @return The amount of underlying owned by `owner`
     */
    function balanceOfUnderlying(address owner) external returns (uint256) {
        owner; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Get a snapshot of the account's balances, and the cached exchange rate
     * @dev This is used by comptroller to more efficiently perform liquidity checks.
     * @param account Address of the account to snapshot
     * @return (possible error, token balance, borrow balance, exchange rate mantissa)
     */
    function getAccountSnapshot(address account)
        external
        view
        returns (
            uint256,
            uint256,
            uint256,
            uint256
        )
    {
        account; // Shh
        delegateToViewAndReturn();
    }

    /**
     * @notice Returns the current per-block borrow interest rate for this apeToken
     * @return The borrow interest rate per block, scaled by 1e18
     */
    function borrowRatePerBlock() external view returns (uint256) {
        delegateToViewAndReturn();
    }

    /**
     * @notice Returns the current per-block supply interest rate for this apeToken
     * @return The supply interest rate per block, scaled by 1e18
     */
    function supplyRatePerBlock() external view returns (uint256) {
        delegateToViewAndReturn();
    }

    /**
     * @notice Returns the current total borrows plus accrued interest
     * @return The total borrows with interest
     */
    function totalBorrowsCurrent() external returns (uint256) {
        delegateAndReturn();
    }

    /**
     * @notice Accrue interest to updated borrowIndex and then calculate account's borrow balance using the updated borrowIndex
     * @param account The address whose balance should be calculated after updating borrowIndex
     * @return The calculated balance
     */
    function borrowBalanceCurrent(address account) external returns (uint256) {
        account; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Return the borrow balance of account based on stored data
     * @param account The address whose balance should be calculated
     * @return The calculated balance
     */
    function borrowBalanceStored(address account) public view returns (uint256) {
        account; // Shh
        delegateToViewAndReturn();
    }

    /**
     * @notice Accrue interest then return the up-to-date exchange rate
     * @return Calculated exchange rate scaled by 1e18
     */
    function exchangeRateCurrent() public returns (uint256) {
        delegateAndReturn();
    }

    /**
     * @notice Calculates the exchange rate from the underlying to the ApeToken
     * @dev This function does not accrue interest before calculating the exchange rate
     * @return Calculated exchange rate scaled by 1e18
     */
    function exchangeRateStored() public view returns (uint256) {
        delegateToViewAndReturn();
    }

    /**
     * @notice Get cash balance of this apeToken in the underlying asset
     * @return The quantity of underlying asset owned by this contract
     */
    function getCash() external view returns (uint256) {
        delegateToViewAndReturn();
    }

    /**
     * @notice Applies accrued interest to total borrows and reserves.
     * @dev This calculates interest accrued from the last checkpointed block
     *      up to the current block and writes new checkpoint to storage.
     */
    function accrueInterest() public returns (uint256) {
        delegateAndReturn();
    }

    /**
     * @notice Transfers collateral tokens (this market) to the liquidator.
     * @dev Will fail unless called by another apeToken during the process of liquidation.
     *  Its absolutely critical to use msg.sender as the borrowed apeToken and not a parameter.
     * @param liquidator The account receiving seized collateral
     * @param borrower The account having collateral seized
     * @param seizeTokens The number of apeTokens to seize
     * @param feeTokens The number of apeTokens as fee
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function seize(
        address liquidator,
        address borrower,
        uint256 seizeTokens,
        uint256 feeTokens
    ) external returns (uint256) {
        liquidator;
        borrower;
        seizeTokens;
        feeTokens; // Shh
        delegateAndReturn();
    }

    /*** Admin Functions ***/

    /**
     * @notice Begins transfer of admin rights. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer.
     * @dev Admin function to begin change of admin. The newPendingAdmin must call `_acceptAdmin` to finalize the transfer.
     * @param newPendingAdmin New pending admin.
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _setPendingAdmin(address payable newPendingAdmin) external returns (uint256) {
        newPendingAdmin; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Sets a new comptroller for the market
     * @dev Admin function to set a new comptroller
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _setComptroller(ComptrollerInterface newComptroller) public returns (uint256) {
        newComptroller; // Shh
        delegateAndReturn();
    }

    /**
     * @notice accrues interest and sets a new reserve factor for the protocol using _setReserveFactorFresh
     * @dev Admin function to accrue interest and set a new reserve factor
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _setReserveFactor(uint256 newReserveFactorMantissa) external returns (uint256) {
        newReserveFactorMantissa; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Accepts transfer of admin rights. msg.sender must be pendingAdmin
     * @dev Admin function for pending admin to accept role and update admin
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _acceptAdmin() external returns (uint256) {
        delegateAndReturn();
    }

    /**
     * @notice Accrues interest and adds reserves by transferring from admin
     * @param addAmount Amount of reserves to add
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _addReserves(uint256 addAmount) external returns (uint256) {
        addAmount; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Accrues interest and reduces reserves by transferring to admin
     * @param reduceAmount Amount of reduction to reserves
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _reduceReserves(uint256 reduceAmount) external returns (uint256) {
        reduceAmount; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Accrues interest and updates the interest rate model using _setInterestRateModelFresh
     * @dev Admin function to accrue interest and update the interest rate model
     * @param newInterestRateModel the new interest rate model to use
     * @return uint 0=success, otherwise a failure (see ErrorReporter.sol for details)
     */
    function _setInterestRateModel(InterestRateModel newInterestRateModel) public returns (uint256) {
        newInterestRateModel; // Shh
        delegateAndReturn();
    }

    /**
     * @notice updates the borrow fee
     * @param newBorrowFee the new borrow fee
     */
    function _setBorrowFee(uint256 newBorrowFee) public {
        newBorrowFee; // Shh
        delegateAndReturn();
    }

    /**
     * @notice updates the helper
     * @param newHelper the new helper
     */
    function _setHelper(address newHelper) public {
        newHelper; // Shh
        delegateAndReturn();
    }

    /**
     * @notice sets the snapshot vote delegation
     * @param delegateContract the delegation contract
     * @param id the space ID
     * @param delegate the delegate address
     */
    function _setDelegate(
        address delegateContract,
        bytes32 id,
        address delegate
    ) external {
        delegateContract;
        id;
        delegate; // Shh
        delegateAndReturn();
    }

    /**
     * @notice Internal method to delegate execution to another contract
     * @dev It returns to the external caller whatever the implementation returns or forwards reverts
     * @param callee The contract to delegatecall
     * @param data The raw data to delegatecall
     * @return The returned bytes from the delegatecall
     */
    function delegateTo(address callee, bytes memory data) internal returns (bytes memory) {
        (bool success, bytes memory returnData) = callee.delegatecall(data);
        assembly {
            if eq(success, 0) {
                revert(add(returnData, 0x20), returndatasize)
            }
        }
        return returnData;
    }

    /**
     * @notice Delegates execution to the implementation contract
     * @dev It returns to the external caller whatever the implementation returns or forwards reverts
     * @param data The raw data to delegatecall
     * @return The returned bytes from the delegatecall
     */
    function delegateToImplementation(bytes memory data) public returns (bytes memory) {
        return delegateTo(implementation, data);
    }

    /**
     * @notice Delegates execution to an implementation contract
     * @dev It returns to the external caller whatever the implementation returns or forwards reverts
     *  There are an additional 2 prefix uints from the wrapper returndata, which we ignore since we make an extra hop.
     * @param data The raw data to delegatecall
     * @return The returned bytes from the delegatecall
     */
    function delegateToViewImplementation(bytes memory data) public view returns (bytes memory) {
        (bool success, bytes memory returnData) = address(this).staticcall(
            abi.encodeWithSignature("delegateToImplementation(bytes)", data)
        );
        assembly {
            if eq(success, 0) {
                revert(add(returnData, 0x20), returndatasize)
            }
        }
        return abi.decode(returnData, (bytes));
    }

    function delegateToViewAndReturn() private view returns (bytes memory) {
        (bool success, ) = address(this).staticcall(
            abi.encodeWithSignature("delegateToImplementation(bytes)", msg.data)
        );

        assembly {
            let free_mem_ptr := mload(0x40)
            returndatacopy(free_mem_ptr, 0, returndatasize)

            switch success
            case 0 {
                revert(free_mem_ptr, returndatasize)
            }
            default {
                return(add(free_mem_ptr, 0x40), returndatasize)
            }
        }
    }

    function delegateAndReturn() private returns (bytes memory) {
        (bool success, ) = implementation.delegatecall(msg.data);

        assembly {
            let free_mem_ptr := mload(0x40)
            returndatacopy(free_mem_ptr, 0, returndatasize)

            switch success
            case 0 {
                revert(free_mem_ptr, returndatasize)
            }
            default {
                return(free_mem_ptr, returndatasize)
            }
        }
    }

    /**
     * @notice Delegates execution to an implementation contract
     * @dev It returns to the external caller whatever the implementation returns or forwards reverts
     */
    function() external payable {
        require(msg.value == 0, "ApeErc20Delegator:fallback: cannot send value to fallback");

        // delegate all other functions to current implementation
        delegateAndReturn();
    }
}
