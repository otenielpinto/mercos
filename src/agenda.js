const db = require("./infra/mongoClient");
const lib = require("./utils/lib");

const nodeSchedule = require("node-schedule");
const categoriaController = require("./controller/categoriaController");
const produtoController = require("./controller/produtoController");
const diversosController = require("./controller/diversosController");
const transportadoraController = require("./controller/transportadoraController");
const pedidoController = require("./controller/pedidoController");
const clienteController = require("./controller/clienteController");
const condPagamentoController = require("./controller/condPagamentoController");

global.processandoNow = 0;

async function task() {
  global.processandoNow = 1;

  //limitar horario de trabalho
  if ((await lib.isManutencao()) == 1) {
    console.log("Serviço em manutenção " + lib.currentDateTimeStr());
    global.processandoNow = 0;
    return;
  }

  try {
    await condPagamentoController.init();
    await categoriaController.init();
    await transportadoraController.init();
  } finally {
    await pedidoController.init();
    await produtoController.init();
    await diversosController.init();
    await clienteController.init();

    global.processandoNow = 0;
    console.log(
      " Fim do processamento rotina task " + lib.currentDateTimeStr()
    );
  }
}

async function init() {
  //await condPagamentoController.init();
  //await categoriaController.init();
  // await transportadoraController.init();

  //await pedidoController.init();
  // await diversosController.init();
  // await produtoController.init();
  // await clienteController.init();

  try {
    let time = process.env.CRON_JOB_TIME || 10; //tempo em minutos
    const job = nodeSchedule.scheduleJob(`*/${time} * * * *`, async () => {
      console.log(" Job start as " + lib.currentDateTimeStr());
      await db.validateTimeConnection();
      if (global.processandoNow == 1) {
        console.log(
          " Job can't started [processing] " + lib.currentDateTimeStr()
        );
      } else {
        try {
          await task();
        } finally {
          global.processandoNow = 0;
        }
      }
    });
  } catch (err) {
    throw new Error(`Can't start agenda! Err: ${err.message}`);
  }
}
module.exports = { init };
