/**
 * Production environment guard for automated testing and maintenance scripts.
 * Prevents accidental execution against production databases or deployments.
 */
function assertNotProduction(scriptName = "Script") {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_PROD_TEST_EXECUTION !== "true") {
    console.error(`\n[SECURITY GUARD] Refusing to run ${scriptName} in production environment.`);
    console.error("If this is an intentional production maintenance task, set ALLOW_PROD_TEST_EXECUTION=true explicitly.\n");
    process.exit(1);
  }
}

module.exports = {
  assertNotProduction,
};
