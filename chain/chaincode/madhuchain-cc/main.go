package main

import (
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	chaincode, err := contractapi.NewChaincode(NewMadhuChainContract())
	if err != nil {
		fmt.Printf("Error creating MadhuChain chaincode: %s\n", err)
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting MadhuChain chaincode: %s\n", err)
	}
}
