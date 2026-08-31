package main

import (
	"fmt"

	"github.com/hyperledger/fabric-contract-api-go/contractapi"
)

func main() {
	chaincode, err := contractapi.NewChaincode(NewHoneyChainContract())
	if err != nil {
		fmt.Printf("Error creating HoneyChain chaincode: %s\n", err)
		return
	}
	if err := chaincode.Start(); err != nil {
		fmt.Printf("Error starting HoneyChain chaincode: %s\n", err)
	}
}
