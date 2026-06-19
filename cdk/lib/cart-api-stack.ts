import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import { Construct } from 'constructs';
import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export class CartApiStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const projectRoot = path.join(__dirname, '../..');

    // Look up the existing default VPC where RDS lives
    const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', { isDefault: true });

    // Use the existing RDS security group so Lambda is allowed to connect
    const rdsSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(
      this,
      'RdsSecurityGroup',
      'sg-08b40e45dfa23c0d7',
    );

    const cartApiLambda = new lambda.Function(this, 'CartApiLambda', {
      functionName: 'cart-api',
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'lambda.handler',
      code: lambda.Code.fromAsset(projectRoot, {
        bundling: {
          local: {
            tryBundle(outputDir: string): boolean {
              fs.cpSync(
                path.join(projectRoot, 'dist'),
                outputDir,
                { recursive: true },
              );
              fs.copyFileSync(
                path.join(projectRoot, 'package.json'),
                path.join(outputDir, 'package.json'),
              );
              fs.copyFileSync(
                path.join(projectRoot, 'package-lock.json'),
                path.join(outputDir, 'package-lock.json'),
              );
              execSync('npm ci --omit=dev', {
                cwd: outputDir,
                stdio: 'inherit',
              });
              return true;
            },
          },
          image: lambda.Runtime.NODEJS_20_X.bundlingImage,
          command: [
            'bash',
            '-c',
            [
              'cp -r /asset-input/dist/. /asset-output/',
              'cp /asset-input/package*.json /asset-output/',
              'npm ci --omit=dev --prefix /asset-output',
            ].join(' && '),
          ],
        },
      }),
      memorySize: 256,
      timeout: cdk.Duration.seconds(30),
      vpc,
      allowPublicSubnet: true,
      securityGroups: [rdsSecurityGroup],
      environment: {
        NODE_ENV: 'production',
        DB_HOST: 'cart-api-db.cbk860cage34.eu-central-1.rds.amazonaws.com',
        DB_PORT: '5432',
        DB_NAME: 'postgres',
        DB_USER: 'postgres',
        DB_PASSWORD: 'cart-api-db',
      },
    });

    const httpApi = new apigatewayv2.HttpApi(this, 'CartApiHttpApi', {
      apiName: 'cart-api',
      corsPreflight: {
        allowHeaders: ['Authorization', 'Content-Type'],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
        allowOrigins: ['*'],
      },
    });

    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: new integrations.HttpLambdaIntegration(
        'CartApiIntegration',
        cartApiLambda,
      ),
    });

    new cdk.CfnOutput(this, 'CartApiUrl', {
      value: httpApi.url ?? '',
      description: 'Cart API Gateway URL',
    });
  }
}
