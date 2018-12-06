CREATE PROCEDURE [SPRINT\Vasil].[TestProcedure]

AS
BEGIN

DECLARE @brand nvarchar(25), @name nvarchar(25), @brand_an nvarchar(25),
@name_an nvarchar(25), @analog_id int, @message varchar(80), @counter int;


DECLARE catalog_cursor CURSOR FOR
SELECT  dbo.[Каталог запчастей].NAME, dbo.Брэнды.Брэнд, dbo.[Каталог запчастей].ID_аналога
FROM dbo.[Каталог запчастей] INNER JOIN
    dbo.Брэнды ON dbo.[Каталог запчастей].ID_Брэнда = dbo.Брэнды.ID_Брэнда
SET @counter = 0;
OPEN catalog_cursor

FETCH NEXT FROM catalog_cursor
INTO @name, @brand, @analog_id

WHILE @@FETCH_STATUS = 0
BEGIN
	SET @counter = @counter + 1;
	PRINT ' '
    SELECT @message = '----- Counter : ' + str(@counter)

    PRINT @message

    DECLARE analog_cursor CURSOR FOR
    SELECT dbo.[Каталог запчастей].NAME, dbo.Брэнды.Брэнд
    FROM dbo.[Каталог запчастей] INNER JOIN
    dbo.Брэнды ON dbo.[Каталог запчастей].ID_Брэнда = dbo.Брэнды.ID_Брэнда
    WHERE dbo.[Каталог запчастей].ID_аналога = @analog_id

    OPEN analog_cursor
    FETCH NEXT FROM analog_cursor INTO @name_an, @brand_an

    WHILE @@FETCH_STATUS = 0
    BEGIN

        IF NOT EXISTS (SELECT     Spare_Brands_1.Brand_Name, Spare_Names_1.Spare_Name, AnalogsDB_0606.dbo.Spare_Names.Spare_Name AS Expr1, AnalogsDB_0606.dbo.Spare_Brands.Brand_Name AS Expr2
		FROM         AnalogsDB_0606.dbo.Spare_Analogs INNER JOIN
                      AnalogsDB_0606.dbo.Spare_Brands ON AnalogsDB_0606.dbo.Spare_Analogs.Brand_ID = AnalogsDB_0606.dbo.Spare_Brands.Brand_ID INNER JOIN
                      AnalogsDB_0606.dbo.Spare_Names ON AnalogsDB_0606.dbo.Spare_Analogs.Spare_Name_ID = AnalogsDB_0606.dbo.Spare_Names.Spare_Name_ID INNER JOIN
                      AnalogsDB_0606.dbo.Spare_Brands AS Spare_Brands_1 ON AnalogsDB_0606.dbo.Spare_Analogs.Analog_Brand_ID = Spare_Brands_1.Brand_ID INNER JOIN
                      AnalogsDB_0606.dbo.Spare_Names AS Spare_Names_1 ON AnalogsDB_0606.dbo.Spare_Analogs.Analog_Spare_Name_ID = Spare_Names_1.Spare_Name_ID
		WHERE     (Spare_Names_1.Spare_Name = @name_an) AND (Spare_Brands_1.Brand_Name = @brand_an) AND (AnalogsDB_0606.dbo.Spare_Brands.Brand_Name = @brand) AND
                      (AnalogsDB_0606.dbo.Spare_Names.Spare_Name = @name))
        BEGIN
			IF NOT EXISTS(SELECT brand, name, brand_an, name_an
			FROM [SPRINT\Vasil].analog_temp
			WHERE (brand = @brand) AND (name = @name) AND (brand_an = @brand_an) AND (name_an = @name_an))
				INSERT INTO [SPRINT\Vasil].[analog_temp] ([brand], [name], [brand_an], [name_an])
				VALUES (@brand, @name, @brand_an, @name_an)
        END
    FETCH NEXT FROM analog_cursor INTO @name_an, @brand_an
    END

    CLOSE analog_cursor
    DEALLOCATE analog_cursor
        -- Get the next vendor.

    FETCH NEXT FROM catalog_cursor
    INTO @name, @brand, @analog_id
END
CLOSE catalog_cursor;
DEALLOCATE catalog_cursor;
END

GO

CREATE TABLE [SPRINT\Vasil].[analog_temp](
	[brand] [nvarchar](20) NOT NULL,
	[name] [nvarchar](25) NOT NULL,
	[brand_an] [nvarchar](20) NOT NULL,
	[name_an] [nvarchar](25) NOT NULL
) ON [PRIMARY]

GO
