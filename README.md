# system-tests-launcher

Builds [cloudify-system-tests](https://github.com/cloudify-cosmo/cloudify-system-tests) launch descriptors.

This readme describes the logic behind the descriptor building that happens in
http://cloudify-cosmo.github.io/system-tests-launcher/

## Terminology
- test suite refers to the preconfigured suites under 'test_suites' in suites.yaml
- test group refers to test lists under 'tests' in the system tests suites.yaml
- handler configuration refers to configurations under 'handler_configurations' in the system tests suites.yaml

## Examples
### single test suite
`hp_openstack_chef_puppet`
### two parallel test suites
`hp_openstack_chef_puppet#hp_openstack_manager_status`
### single test group @ single suite
`openstack_blueprints@hp_openstack_system_tests_region_a`
### single tests section @ single suite
`cosmo_tester/test_suites/test_blueprints/hello_world_bash_test.py@hp_openstack_system_tests_region_a`
### 2 test groups @ single suite
`openstack_blueprints_without_chef_puppet,openstack_chef_puppet_blueprints@hp_openstack_system_tests_region_a`
### 1 test group @ 2 parallel suites (one test group in each suite, e.g. region a and b for system tests 1 tenant)
`openstack_blueprints_without_chef_puppet@hp_openstack_system_tests_region_a#openstack_chef_puppet_blueprints@hp_openstack_system_tests_region_b`

## Descriptor Syntax (mostly BNF):
```
<descriptor> ::= <suite> { # <suite> }
<suite> ::= <tests>@<handler_configuration> | <test_suite>
<tests> ::= <test> { , <test> }
<test> ::= NOSE_TESTS_PATH | TEST_GROUP_NAME
<handler_configuration> ::= HANDLER_CONFIGURATION_NAME
<test_suite> ::= TEST_SUITE_NAME
```
