const Slack = require('./lib/slack')

module.exports = async (robot) => {
  console.log('Yay, the app was loaded!')
  if (process.env.DEBUG) {
    // HACK: If we're attached to the debugger, send output to console
    robot.log.error = console.log
    robot.log.warn = console.log
    robot.log.info = console.log
    robot.log.debug = console.log
    robot.log.trace = console.log
  }

  await setupSlack(robot)

  robot['gitHubIdMapper'] = require('./lib/github-id-mapper')(robot)

  require('./bot_scripts/assign-new-pr-to-review')(robot)
  require('./bot_scripts/assign-approved-pr-to-test')(robot)
  require('./bot_scripts/assign-to-bounty-awaiting-for-approval')(robot)
  require('./bot_scripts/assign-to-bounty-bug-column')(robot)
  require('./bot_scripts/greet-new-contributor')(robot)
  require('./bot_scripts/trigger-automation-test-build')(robot)
  require('./bot_scripts/bounty-awaiting-approval-slack-ping')(robot)
  require('./bot_scripts/notify-reviewers-via-slack')(robot)

  // For more information on building apps:
  // https://probot.github.io/docs/

  // To get your app running against GitHub, see:
  // https://probot.github.io/docs/development/
}

async function setupSlack (robot) {
  Slack.setup(robot, slack => {})

  await new Promise(resolve => {
    robot.on('slack.connected', event => {
      robot.log.info(`Connected to Slack`)

      // Copy Slack RTM and Slack Web clients to the robot object
      robot['slack'] = event.payload.slack
      robot['slackWeb'] = event.payload.slackWeb

      resolve()
    })
  })
}
