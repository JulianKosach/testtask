import ProjectConfig from './config';

const conf = new ProjectConfig('./platform.ini');
console.log('conf.get("debug", "framework")', conf.get("debug", "framework"));