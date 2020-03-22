import ProjectConfig from './config';

const conf = new ProjectConfig('./platform.ini');
console.log('conf.get("env:debug", "framework")', conf.get("env:debug", "framework"));