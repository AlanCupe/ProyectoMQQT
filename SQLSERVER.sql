CREATE DATABASE MQTTSISTEMA;

USE MQTTSISTEMA;
USE master

-- Primero, eliminamos las tablas si ya existen para evitar conflictos
IF OBJECT_ID('dbo.historial_asignaciones', 'U') IS NOT NULL DROP TABLE dbo.historial_asignaciones;
IF OBJECT_ID('dbo.EventosBeacons', 'U') IS NOT NULL DROP TABLE dbo.EventosBeacons;
IF OBJECT_ID('dbo.AsignacionPersonasBeacons', 'U') IS NOT NULL DROP TABLE dbo.AsignacionPersonasBeacons;
IF OBJECT_ID('dbo.AsignacionPersonasAreas', 'U') IS NOT NULL DROP TABLE dbo.AsignacionPersonasAreas;
IF OBJECT_ID('dbo.AsignacionGatewaysAreas', 'U') IS NOT NULL DROP TABLE dbo.AsignacionGatewaysAreas;
IF OBJECT_ID('dbo.AsignacionBeacons', 'U') IS NOT NULL DROP TABLE dbo.AsignacionBeacons;
IF OBJECT_ID('dbo.Areas', 'U') IS NOT NULL DROP TABLE dbo.Areas;
IF OBJECT_ID('dbo.Personas', 'U') IS NOT NULL DROP TABLE dbo.Personas;
IF OBJECT_ID('dbo.iBeacon', 'U') IS NOT NULL DROP TABLE dbo.iBeacon;
IF OBJECT_ID('dbo.Gateway', 'U') IS NOT NULL DROP TABLE dbo.Gateway;

CREATE TABLE Gateway (
    GatewayID INT PRIMARY KEY IDENTITY(1,1),
    MacAddress NVARCHAR(50) NOT NULL,
    GatewayFree INT NULL,
    GatewayLoad FLOAT  NULL,
    Timestamp DATETIME NULL,
	
);


ALTER TABLE Gateway
ADD LastHeartbeat DateTime NULL;

-- Tabla iBeacon
CREATE TABLE iBeacon (
    iBeaconID INT PRIMARY KEY IDENTITY(1,1),
    MacAddress NVARCHAR(50) NOT NULL,
    BleNo INT NULL,
    BleName NVARCHAR(100),
    iBeaconUuid NVARCHAR(50) NOT NULL,
    iBeaconMajor INT NOT NULL,
    iBeaconMinor INT NOT NULL,
    Rssi INT NOT NULL,
    iBeaconTxPower INT NOT NULL,
    Battery INT,
    Timestamp DATETIME,
    GatewayID INT,
    FOREIGN KEY (GatewayID) REFERENCES Gateway(GatewayID) ON DELETE CASCADE
);



CREATE TABLE Personas (
    PersonaID INT PRIMARY KEY IDENTITY,
    Nombre NVARCHAR(100) NOT NULL,
    Apellido NVARCHAR(100) NOT NULL,
    Dni NVARCHAR(8) NOT NULL,
    Cargo NVARCHAR(100) NOT NULL,
    Empresa NVARCHAR(100) NOT NULL
);






CREATE TABLE Areas (
    AreaID INT PRIMARY KEY IDENTITY,
    Nombre NVARCHAR(100) NOT NULL
);

CREATE TABLE AsignacionGatewaysAreas(
    id INT PRIMARY KEY IDENTITY,
    AreaID INT,
    GatewayID INT,
    Timestamp DATETIME,
    FOREIGN KEY (AreaID) REFERENCES Areas(AreaID),
    FOREIGN KEY (GatewayID) REFERENCES Gateway(GatewayID) ON DELETE CASCADE
);

CREATE TABLE AsignacionPersonasBeacons (
    AsignacionID INT PRIMARY KEY IDENTITY,
    PersonaID INT,
    iBeaconID INT,
    Timestamp DATETIME,
    FOREIGN KEY (PersonaID) REFERENCES Personas(PersonaID),
    FOREIGN KEY (iBeaconID) REFERENCES iBeacon(iBeaconID) ON DELETE CASCADE
);

CREATE TABLE EventosBeacons (
    EventoID INT PRIMARY KEY IDENTITY(1,1),
    iBeaconID INT,
    GatewayID INT,
    TipoEvento NVARCHAR(10), -- 'Entrada' o 'Salida'
    Timestamp DATETIME,
    FOREIGN KEY (iBeaconID) REFERENCES iBeacon(iBeaconID) ON DELETE CASCADE,
    FOREIGN KEY (GatewayID) REFERENCES Gateway(GatewayID) -- Eliminar ON DELETE CASCADE para evitar ciclos
);

CREATE TABLE historial_asignaciones (
    HistorialID INT PRIMARY KEY IDENTITY(1,1), 
    PersonaID INT NOT NULL,
    iBeaconID INT NOT NULL,
    fechaAsignacion DATETIME NOT NULL,
    fechaBaja DATETIME
);


CREATE TABLE archivo_historial_asignaciones (
    ArchivoID INT PRIMARY KEY IDENTITY(1,1),
    PersonaID INT NOT NULL,
    iBeaconID INT NOT NULL,
    fechaAsignacion DATETIME NOT NULL,
    fechaBaja DATETIME
);



CREATE TRIGGER insertar_asignacion
ON AsignacionPersonasBeacons
AFTER INSERT
AS
BEGIN
    INSERT INTO historial_asignaciones (PersonaID, iBeaconID, fechaAsignacion)
    SELECT PersonaID, iBeaconID, Timestamp
    FROM INSERTED;

    INSERT INTO archivo_historial_asignaciones (PersonaID, iBeaconID, fechaAsignacion)
    SELECT PersonaID, iBeaconID, Timestamp
    FROM INSERTED;
END;

CREATE TRIGGER actualizar_asignacion
ON AsignacionPersonasBeacons
AFTER DELETE
AS
BEGIN
    UPDATE historial_asignaciones
    SET fechaBaja = GETUTCDATE()
    FROM historial_asignaciones
    INNER JOIN DELETED ON historial_asignaciones.iBeaconID = DELETED.iBeaconID
    AND historial_asignaciones.PersonaID = DELETED.PersonaID
    AND historial_asignaciones.fechaBaja IS NULL;

    UPDATE archivo_historial_asignaciones
    SET fechaBaja = GETUTCDATE()
    FROM archivo_historial_asignaciones
    INNER JOIN DELETED ON archivo_historial_asignaciones.iBeaconID = DELETED.iBeaconID
    AND archivo_historial_asignaciones.PersonaID = DELETED.PersonaID
    AND archivo_historial_asignaciones.fechaBaja IS NULL;
END;
DROP TRIGGER actualizar_asignacion


-- Consultas de verificaci�n
SELECT * FROM Personas;
SELECT * FROM Gateway;
SELECT * FROM iBeacon;
SELECT * FROM Areas;
SELECT * FROM AsignacionGatewaysAreas;
SELECT * FROM AsignacionPersonasBeacons;
SELECT * FROM EventosBeacons;
SELECT * FROM historial_asignaciones;
SELECT * FROM archivo_historial_asignaciones



-- Reseteo de �ndices de las tablas
DELETE FROM historial_asignaciones;
DELETE FROM AsignacionPersonasBeacons;
DELETE FROM EventosBeacons;
DELETE FROM iBeacon;
DELETE FROM Gateway

DBCC CHECKIDENT('iBeacon', RESEED, 0);
DBCC CHECKIDENT('EventosBeacons', RESEED, 0);
DBCC CHECKIDENT('AsignacionPersonasBeacons', RESEED, 0);
DBCC CHECKIDENT('Gateway', RESEED, 0);
DBCC CHECKIDENT('historial_asignaciones', RESEED, 0);
DBCC CHECKIDENT('archivo_historial_asignaciones',RESEED,0);
-- Consultas adicionales

SELECT 
        eb.iBeaconID,
        ib.MacAddress AS BeaconMacAddress,
        ib.Rssi,
        eb.Timestamp,
        eb.GatewayID,
        gw.MacAddress AS GatewayMacAddress,
        eb.TipoEvento,
        CASE 
          WHEN pa.Nombre IS NULL AND pa.Apellido IS NULL THEN 'No asignado'
          ELSE ISNULL(pa.Nombre, '') + ' ' + ISNULL(pa.Apellido, '') 
        END AS PersonaNombreApellido
      FROM 
        EventosBeacons eb
      INNER JOIN 
        (SELECT iBeaconID, GatewayID, MAX(Timestamp) AS MaxTimestamp
         FROM EventosBeacons
         GROUP BY iBeaconID, GatewayID) AS latest
      ON 
        eb.iBeaconID = latest.iBeaconID AND eb.GatewayID = latest.GatewayID AND eb.Timestamp = latest.MaxTimestamp
      INNER JOIN 
        iBeacon ib ON eb.iBeaconID = ib.iBeaconID
      INNER JOIN 
        Gateway gw ON eb.GatewayID = gw.GatewayID
      LEFT JOIN 
        (SELECT 
           ab.MacAddress,
           p.Nombre,
           p.Apellido
         FROM 
           AsignacionPersonasBeacons apb
         INNER JOIN 
           iBeacon ab ON apb.iBeaconID = ab.iBeaconID
         INNER JOIN 
           Personas p ON apb.PersonaID = p.PersonaID) AS pa
      ON 
        ib.MacAddress = pa.MacAddress
      ORDER BY 
        eb.GatewayID, eb.iBeaconID;