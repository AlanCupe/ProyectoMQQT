CREATE DATABASE MQTTSISTEMA;

USE MQTTSISTEMA;


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
	LastHeartbeat DateTime NULL
);




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


CREATE TRIGGER insertar_asignacion
ON AsignacionPersonasBeacons
AFTER INSERT
AS
BEGIN
    INSERT INTO historial_asignaciones (PersonaID, iBeaconID, fechaAsignacion)
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
END;

-- Consultas de verificaci�n
SELECT * FROM Personas;
SELECT * FROM Gateway;
SELECT * FROM iBeacon;
SELECT * FROM Areas;
SELECT * FROM AsignacionGatewaysAreas;
SELECT * FROM AsignacionPersonasBeacons;
SELECT * FROM EventosBeacons;
SELECT * FROM historial_asignaciones;

ALTER TABLE historial_asignaciones
ALTER COLUMN PersonaID INT NULL;


DROP TABLE historial_asignaciones;


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


  -------------


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

-------------------------------

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
                END AS PersonaNombreApellido,
                CASE 
                    WHEN DATEDIFF(second, eb.Timestamp, GETDATE()) < 60 THEN 'active' -- Active if updated in the last minute
                    ELSE 'inactive'
                END AS isActive
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

-----------


SELECT * FROM Gateway;
SELECT 
    GatewayID,
    MacAddress,
    isOn,
    GatewayFree,
    GatewayLoad,
    Timestamp
FROM Gateway;






---******** area de trabajo
WITH RankedBeacons AS (
    SELECT 
        ib.iBeaconID,
        ib.MacAddress,
        ib.Rssi,
        ib.GatewayID,
        ROW_NUMBER() OVER (PARTITION BY ib.MacAddress ORDER BY ib.Rssi DESC) AS rn
    FROM 
        iBeacon ib
)
SELECT 
    rb.iBeaconID,
    rb.MacAddress,
    rb.Rssi,
    rb.GatewayID
FROM 
    RankedBeacons rb
WHERE 
    rb.rn = 1;


	
	--************************************

	-- Aseg�rate de que las columnas clave est�n indexadas
CREATE INDEX idx_iBeacon_MacAddress ON iBeacon (MacAddress);
CREATE INDEX idx_EventosBeacons_iBeaconID ON EventosBeacons (iBeaconID);
CREATE INDEX idx_EventosBeacons_GatewayID ON EventosBeacons (GatewayID);
CREATE INDEX idx_EventosBeacons_Timestamp ON EventosBeacons (Timestamp);

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
WHERE 
    eb.Timestamp = (
        SELECT MAX(Timestamp)
        FROM EventosBeacons
        WHERE iBeaconID = eb.iBeaconID AND GatewayID = eb.GatewayID
    )
AND 
    ib.Rssi = (
        SELECT MAX(Rssi)
        FROM iBeacon
        WHERE MacAddress = ib.MacAddress
    )
ORDER BY 
    eb.GatewayID, eb.iBeaconID;










	-- Parte 2
WITH LatestEventosBeacons AS (
    SELECT 
        eb.iBeaconID,
        eb.GatewayID,
        MAX(eb.Timestamp) AS MaxTimestamp
    FROM 
        EventosBeacons eb
    GROUP BY 
        eb.iBeaconID, eb.GatewayID
),
MaxRssiBeacons AS (
    SELECT 
        ib.MacAddress,
        MAX(ib.Rssi) AS MaxRssi
    FROM 
        iBeacon ib
    GROUP BY 
        ib.MacAddress
),
RankedBeacons AS (
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
        END AS PersonaNombreApellido,
        ROW_NUMBER() OVER (PARTITION BY eb.GatewayID, ib.MacAddress ORDER BY ib.Rssi DESC, eb.Timestamp DESC) AS rn
    FROM 
        EventosBeacons eb
    INNER JOIN 
        LatestEventosBeacons leb ON eb.iBeaconID = leb.iBeaconID AND eb.GatewayID = leb.GatewayID AND eb.Timestamp = leb.MaxTimestamp
    INNER JOIN 
        iBeacon ib ON eb.iBeaconID = ib.iBeaconID
    INNER JOIN 
        MaxRssiBeacons mrb ON ib.MacAddress = mrb.MacAddress AND ib.Rssi = mrb.MaxRssi
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
)
SELECT 
    rb.iBeaconID,
    rb.BeaconMacAddress,
    rb.Rssi,
    rb.Timestamp,
    rb.GatewayID,
    rb.GatewayMacAddress,
    rb.TipoEvento,
    rb.PersonaNombreApellido
FROM 
    RankedBeacons rb
WHERE 
    rb.rn = 1
ORDER BY 
    rb.GatewayID, rb.iBeaconID;




	SELECT * FROM Gateway
	delete  from Gateway
	SELECT * FROM  iBeacon

	WITH LatestEventosBeacons AS (
    SELECT 
        eb.iBeaconID,
        eb.GatewayID,
        MIN(eb.Timestamp) AS MinTimestamp
    FROM 
        EventosBeacons eb
    GROUP BY 
        eb.iBeaconID, eb.GatewayID
),
MaxRssiBeacons AS (
    SELECT 
        ib.MacAddress,
        MAX(ib.Rssi) AS MaxRssi
    FROM 
        iBeacon ib
    GROUP BY 
        ib.MacAddress
),
RankedBeacons AS (
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
        END AS PersonaNombreApellido,
        ROW_NUMBER() OVER (PARTITION BY ib.MacAddress ORDER BY eb.Timestamp ASC) AS rn
    FROM 
        EventosBeacons eb
    INNER JOIN 
        LatestEventosBeacons leb ON eb.iBeaconID = leb.iBeaconID AND eb.GatewayID = leb.GatewayID AND eb.Timestamp = leb.MinTimestamp
    INNER JOIN 
        iBeacon ib ON eb.iBeaconID = ib.iBeaconID
    INNER JOIN 
        MaxRssiBeacons mrb ON ib.MacAddress = mrb.MacAddress AND ib.Rssi = mrb.MaxRssi
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
)
SELECT 
    rb.iBeaconID,
    rb.BeaconMacAddress,
    rb.Rssi,
    rb.Timestamp,
    rb.GatewayID,
    rb.GatewayMacAddress,
    rb.TipoEvento,
    rb.PersonaNombreApellido
FROM 
    RankedBeacons rb
WHERE 
    rb.rn = 1
ORDER BY 
    rb.GatewayID, rb.iBeaconID;


	--PARTE 3
WITH LatestEventosBeacons AS (
    SELECT 
        eb.iBeaconID,
        eb.GatewayID,
        MAX(eb.Timestamp) AS MaxTimestamp
    FROM 
        EventosBeacons eb
    GROUP BY 
        eb.iBeaconID, eb.GatewayID
),
MaxRssiBeacons AS (
    SELECT 
        ib.MacAddress,
        MAX(ib.Rssi) AS MaxRssi
    FROM 
        iBeacon ib
    GROUP BY 
        ib.MacAddress
),
RankedBeacons AS (
    SELECT 
        eb.iBeaconID,
        ib.MacAddress AS BeaconMacAddress,
        ib.Rssi,
        eb.Timestamp,
        eb.GatewayID,
        gw.MacAddress AS GatewayMacAddress,
        CASE 
            WHEN DATEDIFF(MINUTE, eb.Timestamp, GETDATE()) > 5 THEN 'Salida'
            ELSE eb.TipoEvento
        END AS TipoEvento,
        CASE 
            WHEN pa.Nombre IS NULL AND pa.Apellido IS NULL THEN 'No asignado'
            ELSE ISNULL(pa.Nombre, '') + ' ' + ISNULL(pa.Apellido, '') 
        END AS PersonaNombreApellido,
        ROW_NUMBER() OVER (PARTITION BY ib.MacAddress ORDER BY eb.Timestamp DESC) AS rn
    FROM 
        EventosBeacons eb
    INNER JOIN 
        LatestEventosBeacons leb ON eb.iBeaconID = leb.iBeaconID AND eb.GatewayID = leb.GatewayID AND eb.Timestamp = leb.MaxTimestamp
    INNER JOIN 
        iBeacon ib ON eb.iBeaconID = ib.iBeaconID
    INNER JOIN 
        MaxRssiBeacons mrb ON ib.MacAddress = mrb.MacAddress AND ib.Rssi = mrb.MaxRssi
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
)
SELECT 
    rb.iBeaconID,
    rb.BeaconMacAddress,
    rb.Rssi,
    rb.Timestamp,
    rb.GatewayID,
    rb.GatewayMacAddress,
    rb.TipoEvento,
    rb.PersonaNombreApellido
FROM 
    RankedBeacons rb
WHERE 
    rb.rn = 1
ORDER BY 
    rb.GatewayID, rb.iBeaconID;


	--- CUARTO INTENTO, MUESTRA SALIDA DE LOS BEACONS, 

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

-------------------------------------------------
WITH LatestEventosBeacons AS (
    SELECT 
        eb.iBeaconID,
        eb.GatewayID,
        MAX(eb.Timestamp) AS MaxTimestamp
    FROM 
        EventosBeacons eb
    GROUP BY 
        eb.iBeaconID, eb.GatewayID
),
MaxRssiBeacons AS (
    SELECT 
        ib.MacAddress,
        MAX(ib.Rssi) AS MaxRssi
    FROM 
        iBeacon ib
    GROUP BY 
        ib.MacAddress
),
RankedBeacons AS (
    SELECT 
        eb.iBeaconID,
        ib.MacAddress AS BeaconMacAddress,
        ib.Rssi,
        eb.Timestamp,
        eb.GatewayID,
        gw.MacAddress AS GatewayMacAddress,
        CASE 
            WHEN DATEDIFF(MINUTE, eb.Timestamp, GETDATE()) > 5 THEN 'Salida'
            ELSE eb.TipoEvento
        END AS TipoEvento,
        CASE 
            WHEN pa.Nombre IS NULL AND pa.Apellido IS NULL THEN 'No asignado'
            ELSE ISNULL(pa.Nombre, '') + ' ' + ISNULL(pa.Apellido, '') 
        END AS PersonaNombreApellido,
        ROW_NUMBER() OVER (PARTITION BY ib.MacAddress ORDER BY eb.Timestamp DESC) AS rn
    FROM 
        EventosBeacons eb
    INNER JOIN 
        LatestEventosBeacons leb ON eb.iBeaconID = leb.iBeaconID AND eb.GatewayID = leb.GatewayID AND eb.Timestamp = leb.MaxTimestamp
    INNER JOIN 
        iBeacon ib ON eb.iBeaconID = ib.iBeaconID
    INNER JOIN 
        MaxRssiBeacons mrb ON ib.MacAddress = mrb.MacAddress AND ib.Rssi = mrb.MaxRssi
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
)
SELECT 
    rb.iBeaconID,
    rb.BeaconMacAddress,
    rb.Rssi,
    rb.Timestamp,
    rb.GatewayID,
    rb.GatewayMacAddress,
    rb.TipoEvento,
    rb.PersonaNombreApellido
FROM 
    RankedBeacons rb
WHERE 
    rb.rn = 1
ORDER BY 
    rb.GatewayID, rb.iBeaconID;