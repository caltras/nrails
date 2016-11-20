# NRails [![Build Status](https://travis-ci.org/caltras/nrails.svg?branch=master)](https://travis-ci.org/caltras/nrails)
Nrails is a micro framework based rails concept.
## Install
In the moment, Nrails is available only in the github.  
It will be available in npmjs soon.

`npm install -g https://github.com/caltras/nrails#master*`


## Run 
In the command line write **nrails**  
So, one message will be show for you.    

`Welcome to Nrails cli `  
`Choose a command to executing!`

## CLI

In the Cli, it's avaiable the options as  
##### init ( i ):
`nrails init <project name>` or `nrails i <project name>`  
It's responsible for create all initial structure of project.  
For default, Nrails use in memory database (NeDB) but it's possible use Firebase or MongoDB.  
**<project name>** is optional.  If it defined, then the nrails create the folder for project . Else, nrails use the current folder.  
##### model or create-domain ( cd ) :
`nrails model <model name>` or `nrails create-domain <model name>` or `nrails cd <model name>`  
It's responsible for create doamin.
##### controller or create-controller ( cc ) :
`nrails controller <controller name>` or `nrails create-controller <controller name>`  
It's responsible for controller.
##### service or create-service ( cs ) :
`nrails service <service name>` or `nrails create-service <service name>`  
It's responsible for service.
##### run ( r ) :
`nrails run`  or `nrails r`  
It's responsible for run the project.
##### test ( t ) :
`nrails test`  or `nrails t`  
It's responsible for run unit tests of the project.